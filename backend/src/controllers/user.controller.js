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