const Product = require("../models/Product");
const Purchase = require("../models/Purchase");
const StockIn = require("../models/StockIn");
const StockOut = require("../models/StockOut");

const getCurrentStockReport = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .populate("supplier")
      .populate("warehouse");

    const totalStockQuantity = products.reduce((acc, item) => acc + item.quantity, 0);
    const totalStockValue = products.reduce((acc, item) => acc + item.quantity * item.price, 0);

    res.status(200).json({
      totalProducts: products.length,
      totalStockQuantity,
      totalStockValue,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPurchaseReport = async (req, res) => {
  try {
    const purchases = await Purchase.find({})
      .populate("supplier")
      .populate("product")
      .sort({ purchaseDate: -1 });

    const totalPurchasesCount = purchases.length;
    const totalAmountSpent = purchases.reduce((acc, item) => acc + item.totalAmount, 0);

    res.status(200).json({
      totalPurchasesCount,
      totalAmountSpent,
      purchases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStockInReport = async (req, res) => {
  try {
    const stockInRecords = await StockIn.find({})
      .populate("product")
      .sort({ receivedDate: -1 });

    const totalStockInCount = stockInRecords.length;
    const totalQuantityReceived = stockInRecords.reduce((acc, item) => acc + item.quantity, 0);

    res.status(200).json({
      totalStockInCount,
      totalQuantityReceived,
      stockInRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStockOutReport = async (req, res) => {
  try {
    const stockOutRecords = await StockOut.find({})
      .populate("product")
      .sort({ issuedDate: -1 });

    const totalStockOutCount = stockOutRecords.length;
    const totalQuantityIssued = stockOutRecords.reduce((acc, item) => acc + item.quantity, 0);

    res.status(200).json({
      totalStockOutCount,
      totalQuantityIssued,
      stockOutRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLowStockReport = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    })
      .populate("category")
      .populate("supplier")
      .populate("warehouse");

    res.status(200).json({
      totalLowStockProducts: lowStockProducts.length,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCurrentStockReport,
  getPurchaseReport,
  getStockInReport,
  getStockOutReport,
  getLowStockReport,
};
