import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getUsers,
  getRetailers,
  approveRetailer,
  rejectRetailer,
  updateUser,
  deleteUser,
  deleteRetailer,
} from "../controllers/adminController.js";

const router = express.Router();

// Apply protect and adminOnly globally to all admin routes
router.use(protect);
router.use(adminOnly);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/retailers", getRetailers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/retailers/:id/approve", approveRetailer);
router.put("/retailers/:id/reject", rejectRetailer);
router.delete("/retailers/:id", deleteRetailer);

export default router;
