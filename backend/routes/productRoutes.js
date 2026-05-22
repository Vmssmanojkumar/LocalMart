import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, retailerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, retailerOnly, createProduct);
router.put("/:id", protect, retailerOnly, updateProduct);
router.delete("/:id", protect, retailerOnly, deleteProduct);

export default router;
