const express = require('express');
const { sequelize } = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/validations
 * @desc    Get all validation issues with pagination and filtering
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      tipo = '', 
      resolvido = '',
      search = '',
      sort = 'data_validacao',
      order = 'DESC'
    } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build WHERE clause for filtering
    let whereClause = '';
    const replacements = [];
    
    if (tipo) {
      whereClause += ' AND v.tipo_validacao = ?';
      replacements.push(tipo);
    }
    
    if (resolvido === 'true') {
      whereClause += ' AND v.resolvido = true';
    } else if (resolvido === 'false') {
      whereClause += ' AND v.resolvido = false';
    }
    
    if (search) {
      whereClause += ' AND (v.id_unico LIKE ? OR p.cpf LIKE ? OR p.matricula LIKE ? OR p.nome LIKE ?)';
      const searchTerm = `%${search}%`;
      replacements.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Validate sort field to prevent SQL injection
    const validSortFields = [
      'id', 'id_unico', 'tipo_validacao', 'resolvido', 'data_validacao', 'data_resolucao'
    ];
    
    const sortField = validSortFields.includes(sort) ? `v.${sort}` : 'v.data_validacao';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Get total count for pagination
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as total 
       FROM validacoes v 
       LEFT JOIN esteira_propostas p ON v.id_unico = p.id_unico 
       WHERE 1=1 ${whereClause}`,
      { 
        replacements,
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    // Get validations with pagination and filtering
    const validations = await sequelize.query(
      `SELECT v.*, p.cpf, p.matricula, p.nome, p.empregador, p.logo 
       FROM validacoes v 
       LEFT JOIN esteira_propostas p ON v.id_unico = p.id_unico 
       WHERE 1=1 ${whereClause} 
       ORDER BY ${sortField} ${sortOrder} 
       LIMIT ? OFFSET ?`,
      { 
        replacements: [...replacements, parseInt(limit), parseInt(offset)],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    res.json({
      success: true,
      data: {
        validations,
        pagination: {
          total: parseInt(countResult.total),
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(parseInt(countResult.total) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error(`Get validations error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting validations' } 
    });
  }
});

/**
 * @route   GET /api/validations/:id
 * @desc    Get validation by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get validation by ID
    const [validation] = await sequelize.query(
      `SELECT v.*, p.cpf, p.matricula, p.nome, p.empregador, p.logo 
       FROM validacoes v 
       LEFT JOIN esteira_propostas p ON v.id_unico = p.id_unico 
       WHERE v.id = ?`,
      { 
        replacements: [id],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    if (!validation) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Validation not found' } 
      });
    }
    
    res.json({
      success: true,
      data: { validation }
    });
  } catch (error) {
    logger.error(`Get validation error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting validation' } 
    });
  }
});

/**
 * @route   PUT /api/validations/:id/resolve
 * @desc    Resolve a validation issue
 * @access  Private
 */
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if validation exists
    const [validation] = await sequelize.query(
      'SELECT id, id_unico, resolvido FROM validacoes WHERE id = ?',
      { 
        replacements: [id],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    if (!validation) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Validation not found' } 
      });
    }
    
    if (validation.resolvido) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Validation already resolved' } 
      });
    }
    
    // Update validation to resolved
    await sequelize.query(
      `UPDATE validacoes 
       SET resolvido = true, data_resolucao = CURRENT_TIMESTAMP, resolvido_por = ? 
       WHERE id = ?`,
      { 
        replacements: [req.user.usuario, id],
        type: sequelize.QueryTypes.UPDATE 
      }
    );
    
    // Log the resolution action
    await sequelize.query(
      'INSERT INTO historico (operador_id, acao, descricao, ip_address) VALUES (?, ?, ?, ?)',
      { 
        replacements: [
          req.user.id, 
          'RESOLVE_VALIDATION', 
          `User ${req.user.usuario} resolved validation issue ${id}`, 
          req.ip
        ],
        type: sequelize.QueryTypes.INSERT 
      }
    );
    
    res.json({
      success: true,
      data: { 
        message: 'Validation resolved successfully',
        id
      }
    });
  } catch (error) {
    logger.error(`Resolve validation error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error resolving validation' } 
    });
  }
});

/**
 * @route   GET /api/validations/stats/summary
 * @desc    Get validation statistics summary
 * @access  Private
 */
router.get('/stats/summary', auth, async (req, res) => {
  try {
    // Get total validations
    const [totalResult] = await sequelize.query(
      'SELECT COUNT(*) as total FROM validacoes',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get validation type stats
    const typeStats = await sequelize.query(
      'SELECT tipo_validacao, COUNT(*) as count FROM validacoes GROUP BY tipo_validacao',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get resolution stats
    const resolutionStats = await sequelize.query(
      'SELECT resolvido, COUNT(*) as count FROM validacoes GROUP BY resolvido',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get resolver stats
    const resolverStats = await sequelize.query(
      'SELECT resolvido_por, COUNT(*) as count FROM validacoes WHERE resolvido = true GROUP BY resolvido_por',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    res.json({
      success: true,
      data: {
        total: parseInt(totalResult.total),
        byType: typeStats,
        byResolution: resolutionStats,
        byResolver: resolverStats
      }
    });
  } catch (error) {
    logger.error(`Get validation stats error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting validation statistics' } 
    });
  }
});

module.exports = router;