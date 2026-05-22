import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Models
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/localmart";

const seedDatabase = async () => {
  try {
    console.log("Connecting to database at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully to database!");

    // 1. Clear any existing records for our seeded users
    await User.deleteMany({ email: { $in: [
      "admin@localmart.com",
      "john@localmart.com",
      "pantry@localmart.com",
      "organic@localmart.com",
      "freshgo@localmart.com"
    ]}});

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("password123", 10);

    // 2. Insert Administrator
    const admin = await User.create({
      name: "LocalMart Administrator",
      email: "admin@localmart.com",
      password: hashedPassword,
      role: "admin",
      isApproved: true,
    });
    console.log("Seeded Admin: admin@localmart.com / admin123 🔑");

    // 3. Insert Customers
    const customer1 = await User.create({
      name: "John Doe",
      email: "john@localmart.com",
      password: userPassword,
      role: "customer",
      isApproved: true,
    });

    // 4. Insert Retailers (Pending and Approved)
    const retailerApproved1 = await User.create({
      name: "Sarah Jenkins",
      email: "pantry@localmart.com",
      password: userPassword,
      role: "retailer",
      shopName: "The Corner Pantry",
      gstNumber: "29AAAAA1111A1Z1",
      address: "4th Block, Koramangala, Bangalore",
      isApproved: true,
    });

    const retailerApproved2 = await User.create({
      name: "David Miller",
      email: "organic@localmart.com",
      password: userPassword,
      role: "retailer",
      shopName: "Organic Greens Co",
      gstNumber: "29BBBBB2222B2Z2",
      address: "7th Block, Koramangala, Bangalore",
      isApproved: true,
    });

    const retailerPending = await User.create({
      name: "Rahul Verma",
      email: "freshgo@localmart.com",
      password: userPassword,
      role: "retailer",
      shopName: "FreshGo Supermarket",
      gstNumber: "29CCCCC3333C3Z3",
      address: "1st Block, HSR Layout, Bangalore",
      isApproved: false,
    });
    console.log("Seeded Customers & Retailers! 🏪");

    // 5. Insert Products
    await Product.deleteMany({ retailer: { $in: [retailerApproved1._id.toString(), retailerApproved2._id.toString()] } });
    
    const product1 = await Product.create({
      name: "Fresh Whole Milk 1L",
      price: 65,
      stock: 45,
      category: "dairy",
      retailer: retailerApproved1._id.toString(),
      deliveryTime: "1 Hour",
    });

    const product2 = await Product.create({
      name: "Farm Eggs (12 pack)",
      price: 90,
      stock: 20,
      category: "dairy",
      retailer: retailerApproved1._id.toString(),
      deliveryTime: "1 Hour",
    });

    const product3 = await Product.create({
      name: "Organic Honey 500g",
      price: 280,
      stock: 15,
      category: "groceries",
      retailer: retailerApproved2._id.toString(),
      deliveryTime: "2 Hours",
    });
    console.log("Seeded Products for approved retailers! 🍎");

    // 6. Insert Mock Orders
    const mockOrder1 = await Order.create({
      user: customer1._id,
      items: [
        {
          product: product1._id,
          name: product1.name,
          price: product1.price,
          quantity: 2,
        },
        {
          product: product2._id,
          name: product2.name,
          price: product2.price,
          quantity: 1,
        }
      ],
      totalPrice: 220,
      status: "delivered",
      deliveryAddress: "Apartment 4B, Koramangala, Bangalore",
    });

    const mockOrder2 = await Order.create({
      user: customer1._id,
      items: [
        {
          product: product3._id,
          name: product3.name,
          price: product3.price,
          quantity: 1,
        }
      ],
      totalPrice: 280,
      status: "pending",
      deliveryAddress: "Apartment 4B, Koramangala, Bangalore",
    });
    console.log("Seeded Mock Orders for Analytics! 📈");

    console.log("Database successfully populated! Exiting...");
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
