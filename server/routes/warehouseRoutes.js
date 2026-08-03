const express = require("express");
const {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
} = require("../controllers/warehouseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createWarehouse);
router.get("/", protect, getWarehouses);
router.get("/:id", protect, getWarehouseById);
router.put("/:id", protect, updateWarehouse);
router.delete("/:id", protect, deleteWarehouse);

module.exports = router;
