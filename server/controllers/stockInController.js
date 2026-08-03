const StockIn = require("../models/StockIn");
const Product = require("../models/Product");

const addStockIn = async (req, res) => {
  try {
    const { product: productId, quantity, notes, receivedDate } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product and quantity are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.quantity += Number(quantity);
    await product.save();

    const stockIn = await StockIn.create({
      product: productId,
      quantity,
      notes,
      receivedDate: receivedDate || Date.now(),
    });

    const populatedStockIn = await StockIn.findById(stockIn._id).populate("product");

    res.status(201).json(populatedStockIn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStockInHistory = async (req, res) => {
  try {
    const history = await StockIn.find({})
      .populate("product")
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStockIn = async (req, res) => {
  try {
    const stockIn = await StockIn.findById(req.params.id);

    if (!stockIn) {
      return res.status(404).json({ message: "Stock In record not found" });
    }

    const product = await Product.findById(stockIn.product);

    if (product) {
      product.quantity = Math.max(0, product.quantity - stockIn.quantity);
      await product.save();
    }

    await stockIn.deleteOne();

    res.status(200).json({ message: "Stock In record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addStockIn,
  getStockInHistory,
  deleteStockIn,
};
