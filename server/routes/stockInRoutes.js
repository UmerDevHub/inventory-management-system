const express = require("express");
const {
  addStockIn,
  getStockInHistory,
  deleteStockIn,
} = require("../controllers/stockInController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addStockIn);
router.get("/", protect, getStockInHistory);
router.delete("/:id", protect, deleteStockIn);

module.exports = router;
