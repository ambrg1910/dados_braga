const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    // Validate input
    if (!usuario || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Please provide username and password' } 
      });
    }

    // Check if user exists
    const [user] = await sequelize.query(
      'SELECT id, nome, usuario, senha, email, perfil FROM operadores WHERE usuario = ? AND ativo = true',
      { 
        replacements: [usuario],
        type: sequelize.QueryTypes.SELECT 
      }
    );

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Invalid credentials' } 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(senha, user.senha);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Invalid credentials' } 
      });
    }

    // Update last login timestamp
    await sequelize.query(
      'UPDATE operadores SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
      { 
        replacements: [user.id],
        type: sequelize.QueryTypes.UPDATE 
      }
    );

    // Log the login action
    await sequelize.query(
      'INSERT INTO historico (operador_id, acao, descricao, ip_address) VALUES (?, ?, ?, ?)',
      { 
        replacements: [user.id, 'LOGIN', `User ${usuario} logged in`, req.ip],
        type: sequelize.QueryTypes.INSERT 
      }
    );

    // Create JWT payload
    const payload = {
      id: user.id,
      nome: user.nome,
      usuario: user.usuario,
      perfil: user.perfil
    };

    // Sign token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nome: user.nome,
          usuario: user.usuario,
          email: user.email,
          perfil: user.perfil
        }
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error during login' } 
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting user info' } 
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and log the action
 * @access  Private
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // Log the logout action
    await sequelize.query(
      'INSERT INTO historico (operador_id, acao, descricao, ip_address) VALUES (?, ?, ?, ?)',
      { 
        replacements: [req.user.id, 'LOGOUT', `User ${req.user.usuario} logged out`, req.ip],
        type: sequelize.QueryTypes.INSERT 
      }
    );

    res.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error during logout' } 
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Please provide current and new password' } 
      });
    }

    // Get current user with password
    const [user] = await sequelize.query(
      'SELECT id, senha FROM operadores WHERE id = ?',
      { 
        replacements: [req.user.id],
        type: sequelize.QueryTypes.SELECT 
      }
    );

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.senha);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Current password is incorrect' } 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await sequelize.query(
      'UPDATE operadores SET senha = ? WHERE id = ?',
      { 
        replacements: [hashedPassword, req.user.id],
        type: sequelize.QueryTypes.UPDATE 
      }
    );

    // Log the password change
    await sequelize.query(
      'INSERT INTO historico (operador_id, acao, descricao, ip_address) VALUES (?, ?, ?, ?)',
      { 
        replacements: [req.user.id, 'PASSWORD_CHANGE', `User ${req.user.usuario} changed password`, req.ip],
        type: sequelize.QueryTypes.INSERT 
      }
    );

    res.json({
      success: true,
      data: { message: 'Password changed successfully' }
    });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error changing password' } 
    });
  }
});

module.exports = router;