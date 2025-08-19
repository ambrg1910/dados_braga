const express = require('express');
const { sequelize } = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/proposals
 * @desc    Get all proposals with pagination and filtering
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      empregador = '', 
      logo = '', 
      digitado = '',
      startDate = '',
      endDate = '',
      sort = 'data_importacao',
      order = 'DESC'
    } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build WHERE clause for filtering
    let whereClause = '';
    const replacements = [];
    
    if (search) {
      whereClause += ' AND (id_unico LIKE ? OR cpf LIKE ? OR matricula LIKE ? OR nome LIKE ?)';
      const searchTerm = `%${search}%`;
      replacements.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (empregador) {
      whereClause += ' AND empregador = ?';
      replacements.push(empregador);
    }
    
    if (logo) {
      whereClause += ' AND logo = ?';
      replacements.push(parseInt(logo));
    }
    
    if (digitado) {
      whereClause += ' AND digitado = ?';
      replacements.push(digitado);
    }
    
    if (startDate && endDate) {
      whereClause += ' AND data_proposta BETWEEN ? AND ?';
      replacements.push(startDate, endDate);
    } else if (startDate) {
      whereClause += ' AND data_proposta >= ?';
      replacements.push(startDate);
    } else if (endDate) {
      whereClause += ' AND data_proposta <= ?';
      replacements.push(endDate);
    }
    
    // Validate sort field to prevent SQL injection
    const validSortFields = [
      'id', 'id_unico', 'cpf', 'matricula', 'nome', 'proposta30', 
      'digitado', 'empregador', 'logo', 'data_proposta', 'data_importacao'
    ];
    
    const sortField = validSortFields.includes(sort) ? sort : 'data_importacao';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Get total count for pagination
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as total FROM esteira_propostas WHERE 1=1 ${whereClause}`,
      { 
        replacements,
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    // Get proposals with pagination and filtering
    const proposals = await sequelize.query(
      `SELECT * FROM esteira_propostas 
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
        proposals,
        pagination: {
          total: parseInt(countResult.total),
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(parseInt(countResult.total) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error(`Get proposals error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting proposals' } 
    });
  }
});

/**
 * @route   GET /api/proposals/:id
 * @desc    Get proposal by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get proposal by ID
    const [proposal] = await sequelize.query(
      'SELECT * FROM esteira_propostas WHERE id = ?',
      { 
        replacements: [id],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Proposal not found' } 
      });
    }
    
    res.json({
      success: true,
      data: { proposal }
    });
  } catch (error) {
    logger.error(`Get proposal error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting proposal' } 
    });
  }
});

/**
 * @route   GET /api/proposals/unique/:idUnico
 * @desc    Get proposal by unique ID (CPF + Matricula)
 * @access  Private
 */
router.get('/unique/:idUnico', auth, async (req, res) => {
  try {
    const { idUnico } = req.params;
    
    // Get proposal by unique ID
    const [proposal] = await sequelize.query(
      'SELECT * FROM esteira_propostas WHERE id_unico = ?',
      { 
        replacements: [idUnico],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Proposal not found' } 
      });
    }
    
    // Get validation issues for this proposal
    const validations = await sequelize.query(
      'SELECT * FROM validacoes WHERE id_unico = ?',
      { 
        replacements: [idUnico],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    res.json({
      success: true,
      data: { 
        proposal,
        validations
      }
    });
  } catch (error) {
    logger.error(`Get proposal by unique ID error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting proposal' } 
    });
  }
});

/**
 * @route   PUT /api/proposals/:id
 * @desc    Update proposal
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { situacao, extrator, utilizacao } = req.body;
    
    // Check if proposal exists
    const [proposal] = await sequelize.query(
      'SELECT id_unico FROM esteira_propostas WHERE id = ?',
      { 
        replacements: [id],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Proposal not found' } 
      });
    }
    
    // Update only allowed fields
    await sequelize.query(
      `UPDATE esteira_propostas 
       SET situacao = ?, extrator = ?, utilizacao = ?, ultima_atualizacao = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      { 
        replacements: [situacao, extrator, utilizacao, id],
        type: sequelize.QueryTypes.UPDATE 
      }
    );
    
    // Log the update action
    await sequelize.query(
      'INSERT INTO historico (operador_id, acao, descricao, ip_address) VALUES (?, ?, ?, ?)',
      { 
        replacements: [
          req.user.id, 
          'UPDATE_PROPOSAL', 
          `User ${req.user.usuario} updated proposal ${id}`, 
          req.ip
        ],
        type: sequelize.QueryTypes.INSERT 
      }
    );
    
    res.json({
      success: true,
      data: { 
        message: 'Proposal updated successfully',
        id
      }
    });
  } catch (error) {
    logger.error(`Update proposal error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error updating proposal' } 
    });
  }
});

/**
 * @route   GET /api/proposals/stats/summary
 * @desc    Get proposal statistics summary
 * @access  Private
 */
router.get('/stats/summary', auth, async (req, res) => {
  try {
    // Get total proposals
    const [totalResult] = await sequelize.query(
      'SELECT COUNT(*) as total FROM esteira_propostas',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get digitado stats
    const digitadoStats = await sequelize.query(
      'SELECT digitado, COUNT(*) as count FROM esteira_propostas GROUP BY digitado',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get logo stats
    const logoStats = await sequelize.query(
      'SELECT logo, COUNT(*) as count FROM esteira_propostas GROUP BY logo',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get empregador stats
    const empregadorStats = await sequelize.query(
      'SELECT empregador, COUNT(*) as count FROM esteira_propostas GROUP BY empregador',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get validation issues stats
    const validationStats = await sequelize.query(
      'SELECT tipo_validacao, COUNT(*) as count FROM validacoes GROUP BY tipo_validacao',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    res.json({
      success: true,
      data: {
        total: parseInt(totalResult.total),
        digitado: digitadoStats,
        logo: logoStats,
        empregador: empregadorStats,
        validations: validationStats
      }
    });
  } catch (error) {
    logger.error(`Get proposal stats error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting proposal statistics' } 
    });
  }
});

module.exports = router;