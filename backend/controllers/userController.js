import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ── GET /api/users/profile ────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/users/profile ────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "mobileNumber", "address", "city", "pincode", "profileImage", "themePreference"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/users/change-password ────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/users/upload-image ───────────────────────────────────────────────
// Accepts base64 data-URL; stores as string (swap for Cloudinary URL in prod)
export const uploadProfileImage = async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) return res.status(400).json({ message: "No image data provided" });

    const user = await User.findByIdAndUpdate(req.user._id, { profileImage: imageData }, { new: true }).select("-password");
    res.json({ profileImage: user.profileImage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/users/stats ──────────────────────────────────────────────────────
export const getUserStats = async (req, res) => {
  try {
    const { Order } = await import("../models/Order.js");
    const totalOrders = await Order.countDocuments({ user: req.user._id });
    res.json({ totalOrders, wishlistCount: 0 });
  } catch {
    res.json({ totalOrders: 0, wishlistCount: 0 });
  }
};

// ── DELETE /api/users/account ─────────────────────────────────────────────────
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
