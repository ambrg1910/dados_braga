const express = require('express');
const { sequelize } = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get dashboard summary statistics
 * @access  Private
 */
router.get('/summary', auth, async (req, res) => {
  try {
    // Get total proposals
    const [totalProposals] = await sequelize.query(
      'SELECT COUNT(*) as total FROM esteira_propostas',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get digitado stats
    const digitadoStats = await sequelize.query(
      'SELECT digitado, COUNT(*) as count FROM esteira_propostas GROUP BY digitado',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get validation issues
    const [validationIssues] = await sequelize.query(
      'SELECT COUNT(*) as total FROM validacoes WHERE resolvido = false',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get recent uploads
    const recentUploads = await sequelize.query(
      `SELECT h.id, h.operador_id, o.nome as operador_nome, h.acao, h.descricao, h.data_hora 
       FROM historico h 
       JOIN operadores o ON h.operador_id = o.id 
       WHERE h.acao = 'UPLOAD' 
       ORDER BY h.data_hora DESC 
       LIMIT 5`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    res.json({
      success: true,
      data: {
        totalProposals: parseInt(totalProposals.total),
        digitadoStats,
        validationIssues: parseInt(validationIssues.total),
        recentUploads
      }
    });
  } catch (error) {
    logger.error(`Dashboard summary error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting dashboard summary' } 
    });
  }
});

/**
 * @route   GET /api/dashboard/daily-stats
 * @desc    Get daily statistics for the last 30 days
 * @access  Private
 */
router.get('/daily-stats', auth, async (req, res) => {
  try {
    // Get daily proposal counts for the last 30 days
    const dailyProposals = await sequelize.query(
      `SELECT 
        DATE(data_importacao) as date, 
        COUNT(*) as total,
        SUM(CASE WHEN digitado = 'DIGITADO' THEN 1 ELSE 0 END) as digitado,
        SUM(CASE WHEN digitado = 'NÃO DIGITADO' THEN 1 ELSE 0 END) as nao_digitado
       FROM esteira_propostas 
       WHERE data_importacao >= CURRENT_DATE - INTERVAL '30 days' 
       GROUP BY DATE(data_importacao) 
       ORDER BY date`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get daily validation issues for the last 30 days
    const dailyValidations = await sequelize.query(
      `SELECT 
        DATE(data_validacao) as date, 
        COUNT(*) as total,
        SUM(CASE WHEN resolvido = true THEN 1 ELSE 0 END) as resolvido,
        SUM(CASE WHEN resolvido = false THEN 1 ELSE 0 END) as nao_resolvido
       FROM validacoes 
       WHERE data_validacao >= CURRENT_DATE - INTERVAL '30 days' 
       GROUP BY DATE(data_validacao) 
       ORDER BY date`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    res.json({
      success: true,
      data: {
        dailyProposals,
        dailyValidations
      }
    });
  } catch (error) {
    logger.error(`Daily stats error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting daily statistics' } 
    });
  }
});

/**
 * @route   GET /api/dashboard/operator-performance
 * @desc    Get operator performance statistics
 * @access  Private
 */
router.get('/operator-performance', auth, async (req, res) => {
  try {
    // Get operator performance stats
    const operatorStats = await sequelize.query(
      `SELECT 
        o.id, o.nome, 
        o.propostas_validadas, 
        o.propostas_com_erro,
        o.score,
        COUNT(h.id) as total_actions,
        MAX(h.data_hora) as last_action
       FROM operadores o
       LEFT JOIN historico h ON o.id = h.operador_id
       WHERE o.ativo = true
       GROUP BY o.id, o.nome, o.propostas_validadas, o.propostas_com_erro, o.score
       ORDER BY o.score DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    res.json({
      success: true,
      data: {
        operatorStats
      }
    });
  } catch (error) {
    logger.error(`Operator performance error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting operator performance' } 
    });
  }
});

/**
 * @route   GET /api/dashboard/validation-breakdown
 * @desc    Get validation issues breakdown
 * @access  Private
 */
router.get('/validation-breakdown', auth, async (req, res) => {
  try {
    // Get validation type breakdown
    const validationTypes = await sequelize.query(
      `SELECT 
        tipo_validacao, 
        COUNT(*) as total,
        SUM(CASE WHEN resolvido = true THEN 1 ELSE 0 END) as resolvido,
        SUM(CASE WHEN resolvido = false THEN 1 ELSE 0 END) as nao_resolvido
       FROM validacoes 
       GROUP BY tipo_validacao 
       ORDER BY total DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Get employer validation breakdown
    const employerValidations = await sequelize.query(
      `SELECT 
        p.empregador, 
        COUNT(v.id) as total_validations
       FROM validacoes v
       JOIN esteira_propostas p ON v.id_unico = p.id_unico
       GROUP BY p.empregador 
       ORDER BY total_validations DESC
       LIMIT 10`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    res.json({
      success: true,
      data: {
        validationTypes,
        employerValidations
      }
    });
  } catch (error) {
    logger.error(`Validation breakdown error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error getting validation breakdown' } 
    });
  }
});

/**
 * @route   GET /api/dashboard/report
 * @desc    Generate a comprehensive report with filters
 * @access  Private
 */
router.get('/report', auth, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      empregador, 
      logo, 
      operador,
      digitado
    } = req.query;
    
    // Build WHERE clause for filtering
    let whereClause = '';
    const replacements = [];
    
    if (startDate && endDate) {
      whereClause += ' AND p.data_importacao BETWEEN ? AND ?';
      replacements.push(startDate, endDate);
    } else if (startDate) {
      whereClause += ' AND p.data_importacao >= ?';
      replacements.push(startDate);
    } else if (endDate) {
      whereClause += ' AND p.data_importacao <= ?';
      replacements.push(endDate);
    }
    
    if (empregador) {
      whereClause += ' AND p.empregador = ?';
      replacements.push(empregador);
    }
    
    if (logo) {
      whereClause += ' AND p.logo = ?';
      replacements.push(parseInt(logo));
    }
    
    if (operador) {
      whereClause += ' AND p.operador = ?';
      replacements.push(operador);
    }
    
    if (digitado) {
      whereClause += ' AND p.digitado = ?';
      replacements.push(digitado);
    }
    
    // Get proposal summary
    const [proposalSummary] = await sequelize.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN p.digitado = 'DIGITADO' THEN 1 ELSE 0 END) as digitado,
        SUM(CASE WHEN p.digitado = 'NÃO DIGITADO' THEN 1 ELSE 0 END) as nao_digitado,
        COUNT(DISTINCT p.empregador) as total_empregadores,
        COUNT(DISTINCT p.operador) as total_operadores
       FROM esteira_propostas p
       WHERE 1=1 ${whereClause}`,
      { 
        replacements,
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    // Get employer breakdown
    const employerBreakdown = await sequelize.query(
      `SELECT 
        p.empregador, 
        p.logo,
        COUNT(*) as total,
        SUM(CASE WHEN p.digitado = 'DIGITADO' THEN 1 ELSE 0 END) as digitado,
        SUM(CASE WHEN p.digitado = 'NÃO DIGITADO' THEN 1 ELSE 0 END) as nao_digitado
       FROM esteira_propostas p
       WHERE 1=1 ${whereClause}
       GROUP BY p.empregador, p.logo
       ORDER BY total DESC`,
      { 
        replacements,
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    // Get operator breakdown
    const operatorBreakdown = await sequelize.query(
      `SELECT 
        p.operador, 
        COUNT(*) as total,
        SUM(CASE WHEN p.digitado = 'DIGITADO' THEN 1 ELSE 0 END) as digitado,
        SUM(CASE WHEN p.digitado = 'NÃO DIGITADO' THEN 1 ELSE 0 END) as nao_digitado
       FROM esteira_propostas p
       WHERE 1=1 ${whereClause}
       GROUP BY p.operador
       ORDER BY total DESC`,
      { 
        replacements,
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    // Get validation issues
    const validationIssues = await sequelize.query(
      `SELECT 
        v.tipo_validacao, 
        COUNT(*) as total,
        SUM(CASE WHEN v.resolvido = true THEN 1 ELSE 0 END) as resolvido,
        SUM(CASE WHEN v.resolvido = false THEN 1 ELSE 0 END) as nao_resolvido
       FROM validacoes v
       JOIN esteira_propostas p ON v.id_unico = p.id_unico
       WHERE 1=1 ${whereClause}
       GROUP BY v.tipo_validacao
       ORDER BY total DESC`,
      { 
        replacements,
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    res.json({
      success: true,
      data: {
        filters: {
          startDate: startDate || null,
          endDate: endDate || null,
          empregador: empregador || null,
          logo: logo || null,
          operador: operador || null,
          digitado: digitado || null
        },
        summary: proposalSummary,
        employerBreakdown,
        operatorBreakdown,
        validationIssues
      }
    });
  } catch (error) {
    logger.error(`Report generation error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Server error generating report' } 
    });
  }
});

module.exports = router;