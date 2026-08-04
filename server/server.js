const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const authRoutes     = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const warehouseRoutes= require("./routes/warehouseRoutes");
const productRoutes  = require("./routes/productRoutes");
const stockInRoutes  = require("./routes/stockInRoutes");
const stockOutRoutes = require("./routes/stockOutRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const dashboardRoutes= require("./routes/dashboardRoutes");
const reportRoutes   = require("./routes/reportRoutes");
const aiRoutes       = require("./routes/aiRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth",       authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers",  supplierRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/stock-in",   stockInRoutes);
app.use("/api/stock-out",  stockOutRoutes);
app.use("/api/purchases",  purchaseRoutes);
app.use("/api/dashboard",  dashboardRoutes);
app.use("/api/reports",    reportRoutes);
app.use("/api/ai",         aiRoutes);

// Serve Frontend React Static Files in Production
const clientDistPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // Express 5 compatible SPA fallback middleware
  app.use((req, res, next) => {
    if (req.method === "GET") {
      return res.sendFile(path.join(clientDistPath, "index.html"));
    }
    next();
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});