import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  getUserStats,
  deleteAccount,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.put("/upload-image", protect, uploadProfileImage);
router.get("/stats", protect, getUserStats);
router.delete("/account", protect, deleteAccount);

export default router;
