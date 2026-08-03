const express = require("express");
const {
  addStockOut,
  getStockOutHistory,
  deleteStockOut,
} = require("../controllers/stockOutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addStockOut);
router.get("/", protect, getStockOutHistory);
router.delete("/:id", protect, deleteStockOut);

module.exports = router;
