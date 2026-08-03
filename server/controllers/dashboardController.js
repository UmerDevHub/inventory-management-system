const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const Warehouse = require("../models/Warehouse");
const StockIn = require("../models/StockIn");
const StockOut = require("../models/StockOut");
const Purchase = require("../models/Purchase");

const getDashboardSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({});
    const totalCategories = await Category.countDocuments({});
    const totalSuppliers = await Supplier.countDocuments({});
    const totalWarehouses = await Warehouse.countDocuments({});
    const totalStockIn = await StockIn.countDocuments({});
    const totalStockOut = await StockOut.countDocuments({});
    const totalPurchases = await Purchase.countDocuments({});

    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    })
      .populate("category")
      .populate("supplier")
      .populate("warehouse");

    const recentStockIn = await StockIn.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product");

    const recentStockOut = await StockOut.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product");

    const recentPurchases = await Purchase.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product")
      .populate("supplier");

    res.status(200).json({
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalWarehouses,
      totalStockIn,
      totalStockOut,
      totalPurchases,
      lowStockProducts,
      recentActivities: {
        recentStockIn,
        recentStockOut,
        recentPurchases,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
};
