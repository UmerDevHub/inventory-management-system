const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware parsing JSON bodies & enabling CORS
app.use(express.json());
app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.send('Inventory Management API is Running 🚀');
});

// Port definition
const PORT = process.env.PORT || 5000;

// Start listening for HTTP requests
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
