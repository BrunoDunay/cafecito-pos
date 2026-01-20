import express from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/category.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import allowRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware); // Todos deben estar autenticados

router.get("/", getCategories); // Los roles autenticados pueden ver categorías
router.post("/", allowRoles("admin"), createCategory); // Solo admin puede crear
router.delete("/:id", allowRoles("admin"), deleteCategory); // Solo admin puede eliminar

export default router;
