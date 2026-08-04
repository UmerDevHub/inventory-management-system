const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      price,
      quantity,
      reorderLevel,
      category,
      supplier,
      warehouse,
    } = req.body;

    if (!name || !sku || price === undefined || !category || !supplier || !warehouse) {
      return res.status(400).json({ message: "Please fill in all required fields (Name, SKU, Price, Category, Supplier, and Warehouse)." });
    }

    const productExists = await Product.findOne({ sku: sku.trim() });

    if (productExists) {
      return res.status(400).json({ message: `A product with SKU "${sku}" already exists. Please enter a unique SKU code.` });
    }

    const imagePath = req.file
      ? `uploads/${req.file.filename}`
      : req.body.image || "";

    const product = await Product.create({
      name: name.trim(),
      sku: sku.trim(),
      price: Number(price),
      quantity: Number(quantity) || 0,
      reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : 10,
      image: imagePath,
      category,
      supplier,
      warehouse,
    });

    const populatedProduct = await Product.findById(product._id)
      .populate("category")
      .populate("supplier")
      .populate("warehouse");

    res.status(201).json(populatedProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A product with this SKU code already exists. Please use a unique SKU." });
    }
    res.status(400).json({ message: error.message || "Failed to save product. Please check input values." });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .populate("supplier")
      .populate("warehouse");

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("supplier")
      .populate("warehouse");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      price,
      quantity,
      reorderLevel,
      category,
      supplier,
      warehouse,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (sku && sku !== product.sku) {
      const skuExists = await Product.findOne({ sku });
      if (skuExists) {
        return res.status(400).json({ message: "Product with this SKU already exists" });
      }
      product.sku = sku;
    }

    if (req.file) {
      product.image = `uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      product.image = req.body.image;
    }

    if (name) product.name = name;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (reorderLevel !== undefined) product.reorderLevel = reorderLevel;
    if (category) product.category = category;
    if (supplier) product.supplier = supplier;
    if (warehouse) product.warehouse = warehouse;

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("category")
      .populate("supplier")
      .populate("warehouse");

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
