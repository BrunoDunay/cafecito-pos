import express from "express";
import { getUsers, createUser, deleteUser } from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import allowRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware); // Todos deben estar autenticados
router.use(allowRoles("admin")); // Solo admin puede ver, crear o eliminar usuarios

router.get("/", getUsers);
router.post("/", createUser);
router.delete("/:id", deleteUser);

export default router;
