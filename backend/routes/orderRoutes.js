import express from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, retailerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/", protect, getMyOrders);
router.get("/all", protect, retailerOnly, getAllOrders);
router.put("/:id/status", protect, retailerOnly, updateOrderStatus);

export default router;
