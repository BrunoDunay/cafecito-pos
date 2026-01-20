import express from "express";
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById } from "../controllers/product.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import allowRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware); // Todos deben estar autenticados

router.get("/", getProducts); // Todos los roles autenticados pueden ver productos
router.get("/:id", getProductById);
router.post("/", allowRoles("admin"), createProduct);
router.put("/:id", allowRoles("admin"), updateProduct);
router.delete("/:id", allowRoles("admin"), deleteProduct);

export default router;
