const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");

const createPurchase = async (req, res) => {
  try {
    const { supplier, product: productId, quantity, price, purchaseDate } = req.body;

    if (!supplier || !productId || !quantity || price === undefined) {
      return res.status(400).json({ message: "Supplier, product, quantity, and price are required" });
    }

    if (quantity <= 0 || price < 0) {
      return res.status(400).json({ message: "Quantity and price must be valid positive numbers" });
    }

    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const calculatedTotal = Number(quantity) * Number(price);

    product.quantity += Number(quantity);
    await product.save();

    const purchase = await Purchase.create({
      supplier,
      product: productId,
      quantity,
      price,
      totalAmount: req.body.totalAmount || calculatedTotal,
      purchaseDate: purchaseDate || Date.now(),
    });

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate("supplier")
      .populate("product");

    res.status(201).json(populatedPurchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({})
      .populate("supplier")
      .populate("product")
      .sort({ createdAt: -1 });

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplier")
      .populate("product");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase record not found" });
    }

    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: "Purchase record not found" });
    }

    const product = await Product.findById(purchase.product);

    if (product) {
      product.quantity = Math.max(0, product.quantity - purchase.quantity);
      await product.save();
    }

    await purchase.deleteOne();

    res.status(200).json({ message: "Purchase record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  deletePurchase,
};
