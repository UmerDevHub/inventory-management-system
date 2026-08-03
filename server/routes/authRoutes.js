const express = require("express");
const { registerUser, loginUser,getUserProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/getProfile", protect, getUserProfile);

module.exports = router;