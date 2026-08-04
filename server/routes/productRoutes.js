const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Middleware to handle Multer upload errors gracefully
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single("image");
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "File upload failed. Please use a valid image.",
      });
    }
    next();
  });
};

// Public — no auth needed (for QR code scanning from any device)
router.get("/public/:id", getProductById);

// Protected routes
router.post("/", protect, handleUpload, createProduct);
router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);
router.put("/:id", protect, handleUpload, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
