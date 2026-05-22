import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ── GET /api/retailers/profile ────────────────────────────────────────────────
export const getRetailerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user || user.role !== "retailer") {
      return res.status(404).json({ message: "Retailer not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/retailers/profile ────────────────────────────────────────────────
export const updateRetailerProfile = async (req, res) => {
  try {
    const allowed = [
      "name", "mobileNumber", "profileImage",
      "shopName", "gstNumber", "businessAddress", "deliveryRadius",
      "storeDescription", "openingHours", "storeLogo", "storeBanner",
      "storeAccentColor", "themePreference",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ message: "Retailer not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/retailers/change-password ───────────────────────────────────────
export const changeRetailerPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Retailer not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/retailers/upload-logo ────────────────────────────────────────────
export const uploadStoreLogo = async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) return res.status(400).json({ message: "No image data provided" });
    const user = await User.findByIdAndUpdate(req.user._id, { storeLogo: imageData }, { new: true }).select("-password");
    res.json({ storeLogo: user.storeLogo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/retailers/upload-banner ──────────────────────────────────────────
export const uploadStoreBanner = async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) return res.status(400).json({ message: "No image data provided" });
    const user = await User.findByIdAndUpdate(req.user._id, { storeBanner: imageData }, { new: true }).select("-password");
    res.json({ storeBanner: user.storeBanner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/retailers/account ─────────────────────────────────────────────
export const deleteRetailerAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Retailer account deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
