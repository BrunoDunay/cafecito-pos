import User from "../models/User.js";

/* Listar usuarios */
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

/* Crear usuario */
export const createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};

/* Eliminar usuario */
export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ message: "User deleted" });
};
