import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/* Genera token de acceso */
const generateAccessToken = (user) =>
  jwt.sign(
    { user_id: user._id, role: user.role },  
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

/* Genera token de refresco */
const generateRefreshToken = (userId) =>
  jwt.sign({ user_id: userId }, process.env.JWT_REFRESH_SECRET, {  
    expiresIn: '7d',
  });

/* Iniciar sesión */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.is_active === false)  
      return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: generateAccessToken(user),
      refresh_token: generateRefreshToken(user._id),
      user: {
        user_id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

/* Refrescar token */
export const refreshToken = async (req, res, next) => {
  try {
    const decoded = jwt.verify(
      req.body.refresh_token,  
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.user_id);  
    if (!user || !user.is_active)  
      return res.status(401).json({ message: 'Invalid refresh token' });

    res.json({ token: generateAccessToken(user) });
  } catch (e) {
    next(e);
  }
};

/* Obtener usuario autenticado */
export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user_id);  
    res.json({
      user_id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (e) {
    next(e);
  }
};

/* Cerrar sesión */
export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};