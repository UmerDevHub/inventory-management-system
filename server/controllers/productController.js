const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      price,
      quantity,
      reorderLevel,
      image,
      category,
      supplier,
      warehouse,
    } = req.body;

    if (!name || !sku || price === undefined || !category || !supplier || !warehouse) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const productExists = await Product.findOne({ sku });

    if (productExists) {
      return res.status(400).json({ message: "Product with this SKU already exists" });
    }

    const product = await Product.create({
      name,
      sku,
      price,
      quantity: quantity || 0,
      reorderLevel: reorderLevel !== undefined ? reorderLevel : 10,
      image,
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
    res.status(500).json({ message: error.message });
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
      image,
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

    if (name) product.name = name;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (reorderLevel !== undefined) product.reorderLevel = reorderLevel;
    if (image !== undefined) product.image = image;
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
