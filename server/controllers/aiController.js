const Product  = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const Warehouse= require("../models/Warehouse");
const Purchase = require("../models/Purchase");
const StockIn  = require("../models/StockIn");
const StockOut = require("../models/StockOut");
const axios    = require("axios");

/**
 * POST /api/ai/chat
 * Fetches live inventory context, builds a rich system prompt,
 * then calls the OpenAI-compatible endpoint with the user's messages.
 */
const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        reply:
          "⚠️ No API key configured. Add OPENAI_API_KEY to your server/.env file to enable the AI assistant.",
      });
    }

    // ── Fetch live inventory snapshot ────────────────────────────
    const [products, categories, suppliers, warehouses, recentPurchases, recentIn, recentOut] =
      await Promise.all([
        Product.find({}).populate("category").populate("supplier").populate("warehouse").lean(),
        Category.find({}).lean(),
        Supplier.find({}).lean(),
        Warehouse.find({}).lean(),
        Purchase.find({}).sort({ createdAt: -1 }).limit(10).populate("product").populate("supplier").lean(),
        StockIn.find({}).sort({ createdAt: -1 }).limit(10).populate("product").lean(),
        StockOut.find({}).sort({ createdAt: -1 }).limit(10).populate("product").lean(),
      ]);

    // ── Compute key metrics ──────────────────────────────────────
    const totalProducts  = products.length;
    const totalValue     = products.reduce((s, p) => s + p.price * p.quantity, 0).toFixed(2);
    const lowStock       = products.filter((p) => p.quantity > 0 && p.quantity <= p.reorderLevel);
    const outOfStock     = products.filter((p) => p.quantity === 0);
    const totalCategories = categories.length;
    const totalSuppliers  = suppliers.length;
    const totalWarehouses = warehouses.length;

    // ── Build context strings ────────────────────────────────────
    const productList = products
      .map(
        (p) =>
          `• ${p.name} (SKU: ${p.sku}) — Qty: ${p.quantity}, Price: $${p.price}, ` +
          `Reorder Level: ${p.reorderLevel}, Category: ${p.category?.name || "N/A"}, ` +
          `Supplier: ${p.supplier?.name || "N/A"}, Warehouse: ${p.warehouse?.name || "N/A"}`
      )
      .join("\n");

    const lowStockList = lowStock.length
      ? lowStock.map((p) => `• ${p.name} (SKU: ${p.sku}) — only ${p.quantity} left (reorder at ${p.reorderLevel})`).join("\n")
      : "None";

    const outOfStockList = outOfStock.length
      ? outOfStock.map((p) => `• ${p.name} (SKU: ${p.sku})`).join("\n")
      : "None";

    const purchaseList = recentPurchases
      .map(
        (pu) =>
          `• ${pu.product?.name || "Product"} — ${pu.quantity} units @ $${pu.price} each, ` +
          `Total: $${pu.totalAmount}, Status: ${pu.status}, Supplier: ${pu.supplier?.name || "N/A"}`
      )
      .join("\n");

    const stockInList = recentIn
      .map((si) => `• ${si.product?.name || "Product"} — +${si.quantity} units on ${new Date(si.receivedDate || si.createdAt).toLocaleDateString()}`)
      .join("\n");

    const stockOutList = recentOut
      .map((so) => `• ${so.product?.name || "Product"} — -${so.quantity} units on ${new Date(so.date || so.createdAt).toLocaleDateString()}, Reason: ${so.reason || "N/A"}`)
      .join("\n");

    const categoryList  = categories.map((c) => `• ${c.name}`).join("\n");
    const supplierList  = suppliers.map((s) => `• ${s.name} (${s.email || "no email"}, ${s.phone || "no phone"})`).join("\n");
    const warehouseList = warehouses.map((w) => `• ${w.name} — ${w.location || "no location"}`).join("\n");

    // ── System prompt ────────────────────────────────────────────
    const systemPrompt = `You are WarehouseOS AI — a smart, friendly inventory management assistant embedded in an enterprise warehouse system called WarehouseOS.

You have real-time access to all inventory data. Answer questions accurately, concisely, and helpfully. 
When listing items, use clean bullet-point formatting. If asked for calculations, do them precisely.
Always be proactive — if you spot a problem (low stock, out of stock, etc.), mention it even if not asked.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 LIVE INVENTORY SNAPSHOT (as of ${new Date().toLocaleString()})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERVIEW:
• Total Products: ${totalProducts}
• Total Inventory Value: $${totalValue}
• Low Stock Items: ${lowStock.length}
• Out of Stock Items: ${outOfStock.length}
• Categories: ${totalCategories}
• Suppliers: ${totalSuppliers}
• Warehouses: ${totalWarehouses}

ALL PRODUCTS:
${productList || "No products found."}

LOW STOCK ALERTS:
${lowStockList}

OUT OF STOCK:
${outOfStockList}

RECENT PURCHASES (last 10):
${purchaseList || "No recent purchases."}

RECENT STOCK IN (last 10):
${stockInList || "No recent stock in."}

RECENT STOCK OUT (last 10):
${stockOutList || "No recent stock out."}

CATEGORIES:
${categoryList || "No categories."}

SUPPLIERS:
${supplierList || "No suppliers."}

WAREHOUSES:
${warehouseList || "No warehouses."}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Answer the user's questions based on this live data. Keep responses concise but complete. Use emojis sparingly for clarity.`;

    // ── Call OpenAI API ──────────────────────────────────────────
    const aiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.4,
        max_tokens: 600,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const reply = aiRes.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error.response?.data || error.message);
    const msg =
      error.response?.status === 401
        ? "Invalid API key. Please check OPENAI_API_KEY in your .env file."
        : error.response?.status === 429
        ? "Rate limit reached. Please wait a moment and try again."
        : "AI service is temporarily unavailable. Please try again.";
    res.status(500).json({ reply: `⚠️ ${msg}` });
  }
};

module.exports = { chatWithAI };
