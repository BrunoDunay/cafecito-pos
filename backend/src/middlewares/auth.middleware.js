import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔍 [Middleware] Headers:', req.headers);
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [Middleware] No Bearer token');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 [Middleware] Token received');
    
    // Decodifica el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 [Middleware] Decoded token:', decoded);
    
    console.log('🔍 [Middleware] Has user_id?:', 'user_id' in decoded);
    console.log('🔍 [Middleware] Has userId?:', 'userId' in decoded);
    
    const userId = decoded.user_id;  
    
    if (!userId) {
      console.log('❌ [Middleware] No user_id in token');
      return res.status(401).json({ message: 'Invalid token structure' });
    }
    
    console.log('🔍 [Middleware] Looking for user ID:', userId);

    // Busca usuario en la base de datos
    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.log('❌ [Middleware] User not found in DB:', userId);
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.is_active) {  
      console.log('❌ [Middleware] User inactive:', user.email);
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    console.log('✅ [Middleware] User authenticated:', user.email, user.role);
    
    // Agrega usuario a la request
    req.user = user;

    next();
  } catch (error) {
    console.error('❌ [Middleware] Error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;