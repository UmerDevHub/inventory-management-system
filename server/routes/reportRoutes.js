const express = require("express");
const {
  getCurrentStockReport,
  getPurchaseReport,
  getStockInReport,
  getStockOutReport,
  getLowStockReport,
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/current-stock", protect, getCurrentStockReport);
router.get("/purchases", protect, getPurchaseReport);
router.get("/stock-in", protect, getStockInReport);
router.get("/stock-out", protect, getStockOutReport);
router.get("/low-stock", protect, getLowStockReport);

module.exports = router;
