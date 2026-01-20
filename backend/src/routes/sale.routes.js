import express from "express";
import { createSale, getSaleById, getSales } from "../controllers/sale.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import allowRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware); // Todos deben estar autenticados

router.post("/", allowRoles("admin", "seller"), createSale); // Crear venta
router.get("/:id", allowRoles("admin", "seller"), getSaleById); // Ver venta por ID
router.get("/", allowRoles("admin", "seller"), getSales); // Listado de ventas

export default router;
