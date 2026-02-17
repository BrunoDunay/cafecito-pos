import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import { NotFoundError, BadRequestError } from "../utils/errors.js";

const mapUser = (u) => ({
  user_id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  is_active: u.is_active, 
  created_at: u.createdAt,
});

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users.map(mapUser));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }
    
    res.json(mapUser(user));
  } catch (error) {
    if (error.name === 'CastError') {
      next(new BadRequestError("ID de usuario inválido"));
    } else {
      next(error);
    }
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, is_active, password } = req.body;
    
    const updateData = { name, email, role, is_active };
    
    if (password) {
      if (password.length < 6) {
        throw new BadRequestError("La contraseña debe tener al menos 6 caracteres");
      }
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }
    
    res.json(mapUser(user));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      throw new BadRequestError("Nombre, email y contraseña son requeridos");
    }
    
    if (password.length < 6) {
      throw new BadRequestError("La contraseña debe tener al menos 6 caracteres");
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("El email ya está registrado");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role 
    });
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(mapUser(user));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }
    
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};