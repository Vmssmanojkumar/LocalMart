import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Models
import User from "../models/User.js";
import Product from "../models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/localmart";

const seedProducts = async () => {
  try {
    console.log("Connecting to database at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully to database!");

    // Find our approved retailers to assign as product sellers
    const retailer1 = await User.findOne({ email: "pantry@localmart.com" });
    const retailer2 = await User.findOne({ email: "organic@localmart.com" });

    if (!retailer1 || !retailer2) {
      console.warn("⚠️ Warning: Approved retailers 'pantry@localmart.com' and 'organic@localmart.com' were not found. Please run npm run seed:admin first.");
    }

    const r1Id = retailer1 ? retailer1._id.toString() : "60c72b2f9b1d8b22a4567891";
    const r2Id = retailer2 ? retailer2._id.toString() : "60c72b2f9b1d8b22a4567892";

    // Clear all existing products
    console.log("Cleaning products collection...");
    await Product.deleteMany({});

    // Define raw 120 products matching our frontend mock-data
    const productsData = [
      /* ═══════════════ ELECTRONICS (15) ═══════════════ */
      {
        name: "Wireless ANC Headphones",
        price: 8499,
        stock: 25,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Minimalist Smartwatch",
        price: 6999,
        stock: 40,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Ergonomic Gaming Mouse",
        price: 3499,
        stock: 18,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Portable Bluetooth Speaker",
        price: 4599,
        stock: 30,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Pro DSLR Camera",
        price: 54999,
        stock: 8,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Mechanical Keyboard",
        price: 5499,
        stock: 15,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Slim Ultrawide Monitor",
        price: 24999,
        stock: 6,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Ultra Slim Laptop",
        price: 68999,
        stock: 12,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Quadcopter Drone Camera",
        price: 45999,
        stock: 5,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "VR Gaming Headset",
        price: 36999,
        stock: 10,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Fast Charging Power Bank",
        price: 1999,
        stock: 50,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "ANC Wireless Earbuds",
        price: 4999,
        stock: 35,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "HD Graphic Tablet",
        price: 7499,
        stock: 14,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "5G Smart Television",
        price: 34999,
        stock: 7,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Dual-Port Fast Wall Charger",
        price: 1299,
        stock: 60,
        category: "electronics",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },

      /* ═══════════════ FASHION (15) ═══════════════ */
      {
        name: "Oversized Cotton Hoodie",
        price: 1999,
        stock: 22,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Vintage Denim Jacket",
        price: 2899,
        stock: 15,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Premium Designer Sneakers",
        price: 4999,
        stock: 18,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Relaxed Utility Cargo Pants",
        price: 2499,
        stock: 25,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Minimalist Gold Accent Watch",
        price: 3899,
        stock: 12,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Polarized Retro Sunglasses",
        price: 1499,
        stock: 30,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Classic Suede Leather Handbag",
        price: 3599,
        stock: 10,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Graphic Streetwear Tee",
        price: 999,
        stock: 45,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Casual Linen Shirt",
        price: 1899,
        stock: 20,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Classic Dad Baseball Cap",
        price: 799,
        stock: 40,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Summer Floral Dress",
        price: 2199,
        stock: 14,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Knit Wool Winter Coat",
        price: 4999,
        stock: 8,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Italian Leather Formal Shoes",
        price: 3499,
        stock: 11,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Thermal Activewear Hoodie",
        price: 1799,
        stock: 19,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Sterling Silver Band Ring",
        price: 899,
        stock: 35,
        category: "fashion",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },

      /* ═══════════════ GROCERIES (15) ═══════════════ */
      {
        name: "Organic Honeycrisp Apples",
        price: 240,
        stock: 50,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Grass-Fed Organic Milk",
        price: 90,
        stock: 30,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Artisanal Sourdough Bread",
        price: 180,
        stock: 12,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Pasture-Raised Brown Eggs",
        price: 110,
        stock: 25,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Organic Basmati Rice",
        price: 499,
        stock: 40,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Cold Pressed Olive Oil",
        price: 799,
        stock: 20,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Organic Baby Spinach",
        price: 99,
        stock: 18,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Roasted Salted Almonds",
        price: 349,
        stock: 35,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Cold Pressed Orange Juice",
        price: 149,
        stock: 22,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Premium Fresh Fruit Basket",
        price: 899,
        stock: 15,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Organic Green Tea Powder",
        price: 299,
        stock: 28,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Whole Bean Dark Coffee",
        price: 449,
        stock: 24,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Organic Greek Yogurt",
        price: 120,
        stock: 32,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Premium Mix Dry Fruits Box",
        price: 699,
        stock: 16,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Indian Spices Gift Set",
        price: 490,
        stock: 20,
        category: "groceries",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },

      /* ═══════════════ BEAUTY (15) ═══════════════ */
      {
        name: "Botanical Face Serum",
        price: 1499,
        stock: 18,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Velvet Matte Red Lipstick",
        price: 899,
        stock: 35,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Hydrating Moisturizer Cream",
        price: 1299,
        stock: 22,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Argan Oil Nourishing Shampoo",
        price: 799,
        stock: 25,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Parisian Eau de Parfum",
        price: 3499,
        stock: 10,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Skin Renewal Night Cream",
        price: 1899,
        stock: 14,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "12-Piece Makeup Brush Set",
        price: 1599,
        stock: 20,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Ultra-Sheer Sunscreen SPF 50",
        price: 699,
        stock: 45,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Rosemary Active Hair Serum",
        price: 1199,
        stock: 30,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Foaming Facial Cleanser",
        price: 599,
        stock: 40,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Gel Shine Nail Polish Set",
        price: 499,
        stock: 50,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Shea Butter Body Lotion",
        price: 899,
        stock: 24,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Liquid Radiant Foundation",
        price: 1799,
        stock: 15,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Plumping Peptide Lip Gloss",
        price: 649,
        stock: 35,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "1 Hour"
      },
      {
        name: "Luxury Cosmetics Travel Kit",
        price: 2499,
        stock: 8,
        category: "beauty",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },

      /* ═══════════════ HOME & LIVING (15) ═══════════════ */
      {
        name: "Premium Fabric 3-Seater Sofa",
        price: 29999,
        stock: 5,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Nordic Minimalist Table Lamp",
        price: 1899,
        stock: 20,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Brushed Brass Wall Clock",
        price: 1499,
        stock: 15,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Solid Oak Dining Table",
        price: 24999,
        stock: 3,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Linen Semi-Sheer Curtains",
        price: 2299,
        stock: 12,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Egyptian Cotton Bed Sheets",
        price: 3499,
        stock: 18,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Potted Monstera Deliciosa",
        price: 1299,
        stock: 25,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Smart Multi-Color LED Bulb",
        price: 899,
        stock: 50,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1550537687-c91072c4792d?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Hand-woven Wool Area Carpet",
        price: 6499,
        stock: 6,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Nordic Wood Coffee Table",
        price: 4999,
        stock: 8,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Ceramic Table Vase Set",
        price: 1199,
        stock: 22,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Ergonomic Office Chair",
        price: 8999,
        stock: 10,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "10-Piece Copper Cookware Set",
        price: 7499,
        stock: 4,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Solid Wood Storage Cabinet",
        price: 14999,
        stock: 3,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Geometric Gold Wall Decor",
        price: 1799,
        stock: 15,
        category: "home",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },

      /* ═══════════════ SPORTS (15) ═══════════════ */
      {
        name: "Match Leather Football",
        price: 1299,
        stock: 25,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "English Willow Cricket Bat",
        price: 4500,
        stock: 12,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Hex Iron Dumbbells (10kg Pair)",
        price: 2499,
        stock: 15,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Non-Slip Rubber Yoga Mat",
        price: 1199,
        stock: 35,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Lightweight Running Shoes",
        price: 3499,
        stock: 16,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Official Indoor Basketball",
        price: 1899,
        stock: 20,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Vacuum Insulated Sports Bottle",
        price: 899,
        stock: 45,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Smart Active Fitness Band",
        price: 2499,
        stock: 28,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Anti-Burst Gym Yoga Ball",
        price: 799,
        stock: 30,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Carbon Fiber Tennis Racket",
        price: 3899,
        stock: 14,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1560012057-4372e14c5085?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Breathable Leather Gym Gloves",
        price: 599,
        stock: 40,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Compact Folding Treadmill",
        price: 24999,
        stock: 4,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "4 Hours"
      },
      {
        name: "Weighted Speed Skipping Rope",
        price: 499,
        stock: 50,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Aero-Shield Cycling Helmet",
        price: 1799,
        stock: 18,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1596131397999-9d954e7d0130?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Heavy Duty Gym Sports Bag",
        price: 1499,
        stock: 22,
        category: "sports",
        retailer: r2Id,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },

      /* ═══════════════ BOOKS (15) ═══════════════ */
      {
        name: "Mindset Dynamics",
        price: 399,
        stock: 30,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Scale up Strategies",
        price: 450,
        stock: 15,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Mastering TypeScript",
        price: 899,
        stock: 12,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "The Nebula Odyssey",
        price: 349,
        stock: 22,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Atomic Habits Tracker",
        price: 299,
        stock: 40,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Design Systems Blueprint",
        price: 799,
        stock: 10,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "AI & Neural Architectures",
        price: 999,
        stock: 8,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Capital Investments 101",
        price: 499,
        stock: 18,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1592492159418-acd9f5afb5ba?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Deep Work Tactics",
        price: 380,
        stock: 25,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "The Psychology of Time",
        price: 420,
        stock: 14,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Tokyo Neon (Modern Manga)",
        price: 599,
        stock: 20,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "A Shadow in the Rain",
        price: 299,
        stock: 35,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "The Founder Mindset",
        price: 499,
        stock: 16,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Modern Web Architecture",
        price: 849,
        stock: 10,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Art of Clear Thinking",
        price: 360,
        stock: 22,
        category: "books",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },

      /* ═══════════════ TOYS & GAMES (15) ═══════════════ */
      {
        name: "Velvet Plush Teddy Bear",
        price: 999,
        stock: 30,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1559251606-c623743a6d76?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "High-Speed RC Drift Car",
        price: 2499,
        stock: 18,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "LEGO Space Station Creator",
        price: 4999,
        stock: 10,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "1000-Piece Landscape Puzzle",
        price: 699,
        stock: 25,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Weighted Wooden Chess Set",
        price: 1799,
        stock: 12,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Classic Strategy Board Game",
        price: 1199,
        stock: 20,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Electric Classic Toy Train",
        price: 2299,
        stock: 15,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Collector Edition Barbie Doll",
        price: 1499,
        stock: 22,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Magnetic Building Blocks Set",
        price: 1899,
        stock: 35,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Retro Handheld Game Console",
        price: 1299,
        stock: 40,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "STEM Solar Powered Robot",
        price: 1599,
        stock: 16,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "High-Speed Magnetic Rubik's",
        price: 499,
        stock: 50,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1591389703635-e15a07b842d7?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Kids Sporty Mountain Bike",
        price: 6499,
        stock: 6,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "3 Hours"
      },
      {
        name: "Mini Altitude Hold Drone Toy",
        price: 1999,
        stock: 20,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      },
      {
        name: "Marvel Superhero Action Figure",
        price: 899,
        stock: 30,
        category: "toys",
        retailer: r1Id,
        image: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=800&q=80&auto=format&fit=crop",
        deliveryTime: "2 Hours"
      }
    ];

    // Seed products
    console.log(`Inserting ${productsData.length} products...`);
    const insertedProducts = await Product.insertMany(productsData);
    console.log(`Successfully seeded ${insertedProducts.length} premium products in MongoDB! 🛒✨`);

    await mongoose.connection.close();
    console.log("Database connection closed cleanly.");
  } catch (error) {
    console.error("Error seeding products in database:", error);
    process.exit(1);
  }
};

seedProducts();
