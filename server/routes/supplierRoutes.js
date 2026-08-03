const express = require("express");
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createSupplier);
router.get("/", protect, getSuppliers);
router.get("/:id", protect, getSupplierById);
router.put("/:id", protect, updateSupplier);
router.delete("/:id", protect, deleteSupplier);

module.exports = router;
