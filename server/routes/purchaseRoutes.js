const express = require("express");
const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  deletePurchase,
} = require("../controllers/purchaseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPurchase);
router.get("/", protect, getPurchases);
router.get("/:id", protect, getPurchaseById);
router.delete("/:id", protect, deletePurchase);

module.exports = router;
