import User from "../models/User.js";

/* Convierte usuario a snake_case */
const mapUser = (u) => ({
  user_id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  is_active: u.is_active, 
  created_at: u.createdAt,
});

/* Listar usuarios */
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users.map(mapUser));
};

/* Obtener usuario por ID */
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(mapUser(user));
};

/* Actualizar usuario */
export const updateUser = async (req, res) => {
  const { name, email, role, is_active } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role, is_active },
    { new: true }
  ).select("-password");
  res.json(mapUser(user));
};

/* Crear usuario */
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ 
    name, 
    email, 
    password, 
    role 
  });
  res.status(201).json(mapUser(user));
};

/* Eliminar usuario */
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};