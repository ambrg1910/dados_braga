const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies JWT token and adds user data to request object
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Authentication required' } 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const [results] = await sequelize.query(
      'SELECT id, nome, usuario, email, perfil FROM operadores WHERE id = ? AND ativo = true',
      { 
        replacements: [decoded.id],
        type: sequelize.QueryTypes.SELECT 
      }
    );

    if (!results) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'User not found or inactive' } 
      });
    }

    // Add user to request object
    req.user = results;
    req.token = token;
    
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Invalid or expired token' } 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: { message: 'Authentication error' } 
    });
  }
};

/**
 * Admin authorization middleware
 * Ensures the authenticated user has admin privileges
 */
const adminAuth = (req, res, next) => {
  if (!req.user || req.user.perfil !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      error: { message: 'Admin access required' } 
    });
  }
  
  next();
};

module.exports = { auth, adminAuth };