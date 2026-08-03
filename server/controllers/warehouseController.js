const Warehouse = require("../models/Warehouse");

const createWarehouse = async (req, res) => {
  try {
    const { name, location, description } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: "Name and location are required" });
    }

    const warehouseExists = await Warehouse.findOne({ name });

    if (warehouseExists) {
      return res.status(400).json({ message: "Warehouse name already exists" });
    }

    const warehouse = await Warehouse.create({
      name,
      location,
      description,
    });

    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({});
    res.status(200).json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    res.status(200).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const { name, location, description } = req.body;

    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    if (name && name !== warehouse.name) {
      const warehouseExists = await Warehouse.findOne({ name });
      if (warehouseExists) {
        return res.status(400).json({ message: "Warehouse name already exists" });
      }
      warehouse.name = name;
    }

    if (location) warehouse.location = location;
    if (description !== undefined) warehouse.description = description;

    const updatedWarehouse = await warehouse.save();
    res.status(200).json(updatedWarehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    await warehouse.deleteOne();
    res.status(200).json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
};
