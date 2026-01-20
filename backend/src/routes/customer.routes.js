import express from "express";
import { getCustomers, createCustomer, getCustomerById, deleteCustomer } from "../controllers/customer.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import allowRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware); // Todos deben estar autenticados

router.get("/", allowRoles("admin", "seller"), getCustomers); // admin y seller pueden listar
router.post("/", allowRoles("admin", "seller"), createCustomer); // admin y seller pueden crear
router.get("/:id", allowRoles("admin", "seller"), getCustomerById); 
router.delete("/:id", allowRoles("admin", "seller"), deleteCustomer);

export default router;
