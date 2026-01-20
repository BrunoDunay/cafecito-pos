import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/* Helpers */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

/* Login */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: 'User account is deactivated',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* Refresh token */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is required',
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user || user.isActive === false) {
      return res.status(401).json({
        message: 'Invalid refresh token',
      });
    }

    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      token: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

/* Me */
export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('_id email role');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/* Logout */
export const logout = async (req, res) => {
  res.status(200).json({
    message: 'Logged out successfully',
  });
};
