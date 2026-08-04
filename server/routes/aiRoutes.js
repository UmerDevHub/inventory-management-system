const express = require("express");
const { chatWithAI } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected — only logged-in users can query the AI
router.post("/chat", protect, chatWithAI);

module.exports = router;
