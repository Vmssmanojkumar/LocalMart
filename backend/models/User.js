import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "retailer", "admin"],
      default: "customer",
    },

    // ── Shared Profile Fields ─────────────────────────────────────
    profileImage: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    pincode: { type: String, default: "" },
    themePreference: { type: String, enum: ["light", "dark", "system"], default: "system" },
    lastLogin: { type: Date },

    // ── Customer Fields ───────────────────────────────────────────
    // (no extra fields beyond shared)

    // ── Retailer Fields ───────────────────────────────────────────
    shopName: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    businessAddress: { type: String, default: "" },
    deliveryRadius: { type: Number, default: 5 },
    storeDescription: { type: String, default: "" },
    openingHours: { type: String, default: "9:00 AM – 9:00 PM" },
    storeLogo: { type: String, default: "" },
    storeBanner: { type: String, default: "" },
    storeAccentColor: { type: String, default: "#8A9A5B" },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    storeRating: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
