import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userId = decoded.user_id;
    
    if (!userId) {
      throw new UnauthorizedError('Invalid token structure');
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.is_active) {
      throw new ForbiddenError('Account is deactivated');
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

export default authMiddleware;