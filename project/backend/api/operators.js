const express = require('express');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/operators
 * @desc    Get all operators
 * @access  Private/Admin
 */
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const operators = await sequelize.query(
      'SELECT id, nome, usuario, email, perfil, ativo, propostas_validadas, propostas_com_erro, score, ultimo_login, data_criacao FROM operadores ORDER BY nome',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    res.json({
      success: true,
      data: { operators }
    });
  } catch (error) {
    logger.error(`Get operators error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting operators' } 
    });
  }
});

/**
 * @route   GET /api/operators/:id
 * @desc    Get operator by ID
 * @access  Private/Admin
 */
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [operator] = await sequelize.query(
      'SELECT id, nome, usuario, email, perfil, ativo, propostas_validadas, propostas_com_erro, score, ultimo_login, data_criacao FROM operadores WHERE id = ?',
      { 
        replacements: [id],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    if (!operator) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Operator not found' } 
      });
    }
    
    res.json({
      success: true,
      data: { operator }
    });
  } catch (error) {
    logger.error(`Get operator error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting operator' } 
    });
  }
});

/**
 * @route   POST /api/operators
 * @desc    Create a new operator
 * @access  Private/Admin
 */
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { nome, usuario, senha, email, perfil = 'OPERADOR' } = req.body;
    
    // Validate input
    if (!nome || !usuario || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Please provide name, username and password' } 
      });
    }
    
    // Check if username already exists
    const [existingUser] = await sequelize.query(
      'SELECT id FROM operadores WHERE usuario = ?',
      { 
        replacements: [usuario],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Username already exists' } 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);
    
    // Create operator
    const [result] = await sequelize.query(
      'INSERT INTO operadores (nome, usuario, senha, email, perfil) VALUES (?, ?, ?, ?, ?) RETURNING id',
      { 
        replacements: [nome, usuario, hashedPassword, email, perfil],
        type: sequelize.QueryTypes.INSERT 
      }
    );
    
    // Log the action
    await sequelize.query(
      'INSERT INTO historico (operador_id, acao, descricao, ip_address) VALUES (?, ?, ?, ?)',
      { 
        replacements: [
          req.user.id, 
          'CREATE_OPERATOR', 
          `User ${req.user.usuario} created operator ${usuario}`, 
          req.ip
        ],
        type: sequelize.QueryTypes.INSERT 
      }
    );
    
    res.status(201).json({
      success: true,
      data: { 
        message: 'Operator created successfully',
        id: result.id
      }
    });
  } catch (error) {
    logger.error(`Create operator error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error creating operator' } 
    });
  }
});

/**
 * @route   PUT /api/operators/:id
 * @desc    Update operator
 * @access  Private/Admin
 */
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, perfil, ativo } = req.body;
    
    // Check if operator exists
    const [operator] = await sequelize.query(
      'SELECT id FROM operadores WHERE id = ?',
      { 
        replacements: [id],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    if (!operator) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Operator not found' } 
      });
    }
    
    // Update operator
    await sequelize.query(
      'UPDATE operadores SET nome = ?, email = ?, perfil = ?, ativo = ? WHERE id = ?',
      { 
        replacements: [nome, email, perfil, ativo, id],
        type: sequelize.QueryTypes.UPDATE 
      }
    );
    
    // Log the action
    await sequelize.query(
      'INSERT INTO historico (operador_id, acao, descricao, ip_address) VALUES (?, ?, ?, ?)',
      { 
        replacements: [
          req.user.id, 
          'UPDATE_OPERATOR', 
          `User ${req.user.usuario} updated operator ${id}`, 
          req.ip
        ],
        type: sequelize.QueryTypes.INSERT 
      }
    );
    
    res.json({
      success: true,
      data: { 
        message: 'Operator updated successfully',
        id
      }
    });
  } catch (error) {
    logger.error(`Update operator error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error updating operator' } 
    });
  }
});

/**
 * @route   PUT /api/operators/:id/reset-password
 * @desc    Reset operator password
 * @access  Private/Admin
 */
router.put('/:id/reset-password', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Please provide new password' } 
      });
    }
    
    // Check if operator exists
    const [operator] = await sequelize.query(
      'SELECT id, usuario FROM operadores WHERE id = ?',
      { 
        replacements: [id],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    if (!operator) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Operator not found' } 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await sequelize.query(
      'UPDATE operadores SET senha = ? WHERE id = ?',
      { 
        replacements: [hashedPassword, id],
        type: sequelize.QueryTypes.UPDATE 
      }
    );
    
    // Log the action
    await sequelize.query(
      'INSERT INTO historico (operador_id, acao, descricao, ip_address) VALUES (?, ?, ?, ?)',
      { 
        replacements: [
          req.user.id, 
          'RESET_PASSWORD', 
          `User ${req.user.usuario} reset password for operator ${operator.usuario}`, 
          req.ip
        ],
        type: sequelize.QueryTypes.INSERT 
      }
    );
    
    res.json({
      success: true,
      data: { 
        message: 'Password reset successfully',
        id
      }
    });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error resetting password' } 
    });
  }
});

/**
 * @route   GET /api/operators/stats/performance
 * @desc    Get operator performance statistics
 * @access  Private/Admin
 */
router.get('/stats/performance', auth, adminAuth, async (req, res) => {
  try {
    // Get operator performance stats
    const operatorStats = await sequelize.query(
      `SELECT 
        o.id, o.nome, o.usuario, 
        o.propostas_validadas, 
        o.propostas_com_erro,
        o.score,
        COUNT(h.id) as total_actions,
        MAX(h.data_hora) as last_action
       FROM operadores o
       LEFT JOIN historico h ON o.id = h.operador_id
       WHERE o.ativo = true
       GROUP BY o.id, o.nome, o.usuario, o.propostas_validadas, o.propostas_com_erro, o.score
       ORDER BY o.score DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get action breakdown by operator
    const actionBreakdown = await sequelize.query(
      `SELECT 
        operador_id, 
        acao, 
        COUNT(*) as count
       FROM historico
       GROUP BY operador_id, acao
       ORDER BY operador_id, count DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    res.json({
      success: true,
      data: {
        operatorStats,
        actionBreakdown
      }
    });
  } catch (error) {
    logger.error(`Get operator stats error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting operator statistics' } 
    });
  }
});

module.exports = router;