import express from "express";
import {
  getRetailerProfile,
  updateRetailerProfile,
  changeRetailerPassword,
  uploadStoreLogo,
  uploadStoreBanner,
  deleteRetailerAccount,
} from "../controllers/retailerController.js";
import { protect, retailerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, retailerOnly, getRetailerProfile);
router.put("/profile", protect, retailerOnly, updateRetailerProfile);
router.put("/change-password", protect, retailerOnly, changeRetailerPassword);
router.put("/upload-logo", protect, retailerOnly, uploadStoreLogo);
router.put("/upload-banner", protect, retailerOnly, uploadStoreBanner);
router.delete("/account", protect, retailerOnly, deleteRetailerAccount);

export default router;
