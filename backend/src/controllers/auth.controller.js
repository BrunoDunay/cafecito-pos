import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { UnauthorizedError, BadRequestError } from '../utils/errors.js';

const generateAccessToken = (user) =>
  jwt.sign(
    { user_id: user._id, role: user.role },  
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

const generateRefreshToken = (userId) =>
  jwt.sign({ user_id: userId }, process.env.JWT_REFRESH_SECRET, {  
    expiresIn: '7d',
  });

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Email y contraseña son requeridos');
    }

    const user = await User.findOne({ email });
    if (!user || user.is_active === false) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    res.json({
      token: generateAccessToken(user),
      refresh_token: generateRefreshToken(user._id),
      user: {
        user_id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new BadRequestError('Refresh token es requerido');
    }

    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.user_id);

    if (!user || !user.is_active) {
      throw new UnauthorizedError('Refresh token inválido');
    }

    res.json({ token: generateAccessToken(user) });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Refresh token inválido o expirado'));
    } else {
      next(error);
    }
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user_id);
    
    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    res.json({
      user_id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};