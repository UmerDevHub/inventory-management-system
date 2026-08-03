const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected for seeding...");

    const email = "admin@gmail.com";
    const hashedPassword = await bcrypt.hash("123456", 10);

    const user = await User.findOneAndUpdate(
      { email },
      { name: "System Admin", email, password: hashedPassword },
      { upsert: true, new: true }
    );

    console.log(`Admin user reset successfully! Email: ${user.email} | Password: 123456`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedAdminUser();
