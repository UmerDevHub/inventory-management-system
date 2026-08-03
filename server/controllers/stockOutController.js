const StockOut = require("../models/StockOut");
const Product = require("../models/Product");

const addStockOut = async (req, res) => {
  try {
    const { product: productId, quantity, notes, issuedDate } = req.body;

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

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock quantity available" });
    }

    product.quantity -= Number(quantity);
    await product.save();

    const stockOut = await StockOut.create({
      product: productId,
      quantity,
      notes,
      issuedDate: issuedDate || Date.now(),
    });

    const populatedStockOut = await StockOut.findById(stockOut._id).populate("product");

    res.status(201).json(populatedStockOut);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStockOutHistory = async (req, res) => {
  try {
    const history = await StockOut.find({})
      .populate("product")
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStockOut = async (req, res) => {
  try {
    const stockOut = await StockOut.findById(req.params.id);

    if (!stockOut) {
      return res.status(404).json({ message: "Stock Out record not found" });
    }

    const product = await Product.findById(stockOut.product);

    if (product) {
      product.quantity += stockOut.quantity;
      await product.save();
    }

    await stockOut.deleteOne();

    res.status(200).json({ message: "Stock Out record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addStockOut,
  getStockOutHistory,
  deleteStockOut,
};
