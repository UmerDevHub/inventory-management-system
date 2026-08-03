const Supplier = require("../models/Supplier");

const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const supplierExists = await Supplier.findOne({ email });

    if (supplierExists) {
      return res.status(400).json({ message: "Supplier email already exists" });
    }

    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    if (email && email !== supplier.email) {
      const emailExists = await Supplier.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Supplier email already exists" });
      }
      supplier.email = email;
    }

    if (name) supplier.name = name;
    if (phone) supplier.phone = phone;
    if (address) supplier.address = address;

    const updatedSupplier = await supplier.save();
    res.status(200).json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await supplier.deleteOne();
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
