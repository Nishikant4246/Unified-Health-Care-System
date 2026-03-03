import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Super Admin",
      email: "admin@uhcs.com",
      password: hashedPassword,
      role: "admin",
      uniqueId: "ADMIN001",
      phone: "9999999999",
    });

    console.log("✅ Admin created successfully");
    console.log("Email:", admin.email);
    console.log("Password: admin123");
    process.exit();
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();