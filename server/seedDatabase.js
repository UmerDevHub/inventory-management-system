const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

const User = require("./models/User");
const Category = require("./models/Category");
const Supplier = require("./models/Supplier");
const Warehouse = require("./models/Warehouse");
const Product = require("./models/Product");
const Purchase = require("./models/Purchase");
const StockIn = require("./models/StockIn");
const StockOut = require("./models/StockOut");

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB for database seeding...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully!");

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    await Warehouse.deleteMany({});
    await Product.deleteMany({});
    await Purchase.deleteMany({});
    await StockIn.deleteMany({});
    await StockOut.deleteMany({});

    console.log("Existing collections cleared.");

    // 1. Seed Admin User
    const hashedPassword = await bcrypt.hash("123456", 10);
    const adminUser = await User.create({
      name: "System Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
    });
    console.log("Admin user created (admin@gmail.com / 123456)");

    // 2. Seed Categories
    const categories = await Category.insertMany([
      { name: "Computing & Peripherals", description: "Mice, keyboards, monitors, and workstation hardware" },
      { name: "Electronics & Hardware", description: "Smart gadgets, cameras, audio gear, and sensors" },
      { name: "Networking Equipment", description: "Enterprise routers, switches, access points, and cabling" },
      { name: "Office & Furniture", description: "Ergonomic chairs, desks, lamps, and office supplies" },
      { name: "Industrial Tools", description: "Cordless power tools, hardware kits, and maintenance gear" },
      { name: "Storage & Accessories", description: "External SSDs, docking stations, hubs, and memory" },
    ]);
    console.log(`${categories.length} Categories created.`);

    // 3. Seed Suppliers
    const suppliers = await Supplier.insertMany([
      {
        name: "GlobalTech Logistics Ltd",
        email: "sales@globaltech.com",
        phone: "+92 300 5551234",
        address: "Office #14, Blue Area, Islamabad, Pakistan",
      },
      {
        name: "Apex Industrial Supplies",
        email: "info@apexsupplies.com",
        phone: "+1 415 8892011",
        address: "45 Market Street, San Francisco, CA, USA",
      },
      {
        name: "Nexa Electronics Corp",
        email: "support@nexa.io",
        phone: "+1 212 9904321",
        address: "100 Broadway Avenue, New York, NY, USA",
      },
      {
        name: "Metro Distribution Co",
        email: "orders@metrodist.com",
        phone: "+44 20 79460912",
        address: "12 Park Lane, Mayfair, London, UK",
      },
    ]);
    console.log(`${suppliers.length} Suppliers created.`);

    // 4. Seed Warehouses
    const warehouses = await Warehouse.insertMany([
      {
        name: "Central Warehouse",
        location: "New York, USA",
        description: "Primary distribution center and high-tech inventory hub",
      },
      {
        name: "West Coast Hub",
        location: "California, USA",
        description: "Regional fulfillment center for computing accessories",
      },
      {
        name: "Midwest Depot",
        location: "Chicago, USA",
        description: "Spare parts storage and industrial tools facility",
      },
      {
        name: "European Fulfillment Hub",
        location: "London, UK",
        description: "International inventory storage and logistics center",
      },
    ]);
    console.log(`${warehouses.length} Warehouses created.`);

    // 5. Seed Products with Unsplash Images
    const productsData = [
      {
        name: "Wireless Ergonomic Mouse",
        sku: "PRD-101",
        price: 49.99,
        quantity: 85,
        reorderLevel: 15,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60",
        category: categories[0]._id,
        supplier: suppliers[0]._id,
        warehouse: warehouses[0]._id,
      },
      {
        name: "RGB Mechanical Keyboard",
        sku: "PRD-102",
        price: 129.99,
        quantity: 42,
        reorderLevel: 10,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
        category: categories[0]._id,
        supplier: suppliers[2]._id,
        warehouse: warehouses[0]._id,
      },
      {
        name: "UltraWide 34\" Curved Monitor",
        sku: "PRD-103",
        price: 499.00,
        quantity: 18,
        reorderLevel: 5,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60",
        category: categories[0]._id,
        supplier: suppliers[2]._id,
        warehouse: warehouses[1]._id,
      },
      {
        name: "Enterprise Gigabit Router",
        sku: "PRD-104",
        price: 210.50,
        quantity: 25,
        reorderLevel: 8,
        image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=60",
        category: categories[2]._id,
        supplier: suppliers[0]._id,
        warehouse: warehouses[0]._id,
      },
      {
        name: "USB-C Multi-Port Docking Hub",
        sku: "PRD-105",
        price: 79.99,
        quantity: 60,
        reorderLevel: 12,
        image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=60",
        category: categories[5]._id,
        supplier: suppliers[0]._id,
        warehouse: warehouses[1]._id,
      },
      {
        name: "Wireless Noise-Canceling Headset",
        sku: "PRD-106",
        price: 189.99,
        quantity: 30,
        reorderLevel: 10,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        category: categories[1]._id,
        supplier: suppliers[2]._id,
        warehouse: warehouses[0]._id,
      },
      {
        name: "High-Speed Thermal Receipt Printer",
        sku: "PRD-107",
        price: 145.00,
        quantity: 4,
        reorderLevel: 10,
        image: "https://images.unsplash.com/photo-1612815150548-9960722a5564?w=500&auto=format&fit=crop&q=60",
        category: categories[0]._id,
        supplier: suppliers[3]._id,
        warehouse: warehouses[2]._id,
      },
      {
        name: "Industrial Cordless Drill Kit",
        sku: "PRD-108",
        price: 159.00,
        quantity: 3,
        reorderLevel: 8,
        image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60",
        category: categories[4]._id,
        supplier: suppliers[1]._id,
        warehouse: warehouses[2]._id,
      },
      {
        name: "Smart 4K Security Camera",
        sku: "PRD-109",
        price: 95.00,
        quantity: 50,
        reorderLevel: 15,
        image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=500&auto=format&fit=crop&q=60",
        category: categories[1]._id,
        supplier: suppliers[0]._id,
        warehouse: warehouses[3]._id,
      },
      {
        name: "Portable SSD 2TB Rugged",
        sku: "PRD-110",
        price: 169.99,
        quantity: 0,
        reorderLevel: 10,
        image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=60",
        category: categories[5]._id,
        supplier: suppliers[2]._id,
        warehouse: warehouses[1]._id,
      },
      {
        name: "Ergonomic Mesh Office Chair",
        sku: "PRD-111",
        price: 249.00,
        quantity: 14,
        reorderLevel: 5,
        image: "https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=500&auto=format&fit=crop&q=60",
        category: categories[3]._id,
        supplier: suppliers[3]._id,
        warehouse: warehouses[0]._id,
      },
      {
        name: "Smart Dimmable LED Desk Lamp",
        sku: "PRD-112",
        price: 39.99,
        quantity: 95,
        reorderLevel: 20,
        image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500&auto=format&fit=crop&q=60",
        category: categories[3]._id,
        supplier: suppliers[0]._id,
        warehouse: warehouses[1]._id,
      },
    ];

    const products = await Product.insertMany(productsData);
    console.log(`${products.length} Products created.`);

    // 6. Seed Purchases
    const purchasesData = [
      {
        supplier: suppliers[0]._id,
        product: products[0]._id,
        quantity: 100,
        price: 35.00,
        totalAmount: 3500.00,
        purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        supplier: suppliers[2]._id,
        product: products[1]._id,
        quantity: 50,
        price: 90.00,
        totalAmount: 4500.00,
        purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        supplier: suppliers[2]._id,
        product: products[2]._id,
        quantity: 20,
        price: 380.00,
        totalAmount: 7600.00,
        purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        supplier: suppliers[0]._id,
        product: products[3]._id,
        quantity: 30,
        price: 150.00,
        totalAmount: 4500.00,
        purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        supplier: suppliers[1]._id,
        product: products[7]._id,
        quantity: 10,
        price: 110.00,
        totalAmount: 1100.00,
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    const purchases = await Purchase.insertMany(purchasesData);
    console.log(`${purchases.length} Purchase orders created.`);

    // 7. Seed Stock In Records
    const stockInData = [
      {
        product: products[0]._id,
        quantity: 100,
        notes: "Initial shipment received from GlobalTech",
        receivedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        product: products[1]._id,
        quantity: 50,
        notes: "Batch #204 mechanical keyboards arrival",
        receivedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        product: products[2]._id,
        quantity: 20,
        notes: "Curved 34 inch monitors stock replenishment",
        receivedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        product: products[4]._id,
        quantity: 75,
        notes: "USB-C docking hubs bulk shipment",
        receivedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        product: products[8]._id,
        quantity: 60,
        notes: "Smart 4K cameras incoming shipment",
        receivedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    const stockInLogs = await StockIn.insertMany(stockInData);
    console.log(`${stockInLogs.length} Stock In records created.`);

    // 8. Seed Stock Out Records
    const stockOutData = [
      {
        product: products[0]._id,
        quantity: 15,
        notes: "Dispatched to New York Corporate Office",
        issuedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        product: products[1]._id,
        quantity: 8,
        notes: "Fulfillment order #8491 for customer",
        issuedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        product: products[2]._id,
        quantity: 2,
        notes: "Executive workstation installation",
        issuedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        product: products[4]._id,
        quantity: 15,
        notes: "West Coast hub client transfer",
        issuedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        product: products[7]._id,
        quantity: 7,
        notes: "Industrial site maintenance equipment release",
        issuedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    const stockOutLogs = await StockOut.insertMany(stockOutData);
    console.log(`${stockOutLogs.length} Stock Out records created.`);

    console.log("\n=======================================================");
    console.log("🔥 DATABASE SEEDED SUCCESSFULLY WITH HEAVY ENTERPRISE DATA!");
    console.log("Admin Login: admin@gmail.com | Password: 123456");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
