/**
 * Validation utilities for the Card Operations Insights & Validation System
 */

const { EsteiraPropostas, Validacoes } = require('../models');
const { Op } = require('sequelize');
const logger = require('./logger');

/**
 * Check if a proposal exists in the database
 * @param {string} id_unico - Unique identifier (CPF + Matricula)
 * @returns {Promise<Object|null>} - Existing proposal or null
 */
const checkProposalExists = async (id_unico) => {
  try {
    return await EsteiraPropostas.findOne({ where: { id_unico } });
  } catch (error) {
    logger.error(`Error checking if proposal exists: ${error.message}`);
    return null;
  }
};

/**
 * Check for duplicate proposals across all sheets
 * @param {string} id_unico - Unique identifier (CPF + Matricula)
 * @returns {Promise<Array>} - Array of duplicate proposals
 */
const checkForDuplicates = async (id_unico) => {
  try {
    return await EsteiraPropostas.findAll({ 
      where: { id_unico },
      attributes: ['id', 'id_unico', 'fonte_dados', 'data_importacao']
    });
  } catch (error) {
    logger.error(`Error checking for duplicates: ${error.message}`);
    return [];
  }
};

/**
 * Create a validation issue
 * @param {string} id_unico - Unique identifier (CPF + Matricula)
 * @param {string} tipo_validacao - Type of validation issue
 * @param {string} descricao - Description of the issue
 * @returns {Promise<Object|null>} - Created validation issue or null
 */
const createValidationIssue = async (id_unico, tipo_validacao, descricao) => {
  try {
    return await Validacoes.create({
      id_unico,
      tipo_validacao,
      descricao,
      resolvido: false,
      data_validacao: new Date()
    });
  } catch (error) {
    logger.error(`Error creating validation issue: ${error.message}`);
    return null;
  }
};

/**
 * Resolve a validation issue
 * @param {number} validationId - ID of the validation issue
 * @param {number} operadorId - ID of the operator resolving the issue
 * @returns {Promise<boolean>} - Success status
 */
const resolveValidationIssue = async (validationId, operadorId) => {
  try {
    const validation = await Validacoes.findByPk(validationId);
    
    if (!validation) {
      return false;
    }
    
    await validation.update({
      resolvido: true,
      data_resolucao: new Date(),
      resolvido_por: operadorId
    });
    
    return true;
  } catch (error) {
    logger.error(`Error resolving validation issue: ${error.message}`);
    return false;
  }
};

/**
 * Get all validation issues for a proposal
 * @param {string} id_unico - Unique identifier (CPF + Matricula)
 * @returns {Promise<Array>} - Array of validation issues
 */
const getValidationIssues = async (id_unico) => {
  try {
    return await Validacoes.findAll({ 
      where: { id_unico },
      order: [['data_validacao', 'DESC']]
    });
  } catch (error) {
    logger.error(`Error getting validation issues: ${error.message}`);
    return [];
  }
};

/**
 * Get unresolved validation issues
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - Array of unresolved validation issues
 */
const getUnresolvedIssues = async (filters = {}) => {
  try {
    const whereClause = { resolvido: false };
    
    if (filters.tipo_validacao) {
      whereClause.tipo_validacao = filters.tipo_validacao;
    }
    
    if (filters.id_unico) {
      whereClause.id_unico = filters.id_unico;
    }
    
    return await Validacoes.findAll({ 
      where: whereClause,
      order: [['data_validacao', 'DESC']],
      limit: filters.limit || 100,
      offset: filters.offset || 0
    });
  } catch (error) {
    logger.error(`Error getting unresolved issues: ${error.message}`);
    return [];
  }
};

/**
 * Validate a proposal against business rules
 * @param {Object} proposal - Proposal data
 * @returns {Promise<Object>} - Validation results
 */
const validateProposal = async (proposal) => {
  const results = {
    isValid: true,
    issues: []
  };
  
  try {
    const { id_unico, cpf, matricula, nome, empregador, proposta30 } = proposal;
    
    // Check for required fields
    if (!cpf || !matricula) {
      results.isValid = false;
      results.issues.push({
        tipo_validacao: 'DADOS_INCOMPLETOS',
        descricao: 'CPF or Matricula is missing'
      });
      
      await createValidationIssue(
        id_unico, 
        'DADOS_INCOMPLETOS', 
        'CPF or Matricula is missing'
      );
    }
    
    // Check for duplicates
    const duplicates = await checkForDuplicates(id_unico);
    
    if (duplicates.length > 1) {
      results.isValid = false;
      results.issues.push({
        tipo_validacao: 'DUPLICADO',
        descricao: `Found ${duplicates.length} duplicate records`
      });
      
      await createValidationIssue(
        id_unico, 
        'DUPLICADO', 
        `Found ${duplicates.length} duplicate records`
      );
    }
    
    // Check for data consistency
    if (!nome || nome === '-') {
      results.isValid = false;
      results.issues.push({
        tipo_validacao: 'DADOS_INCOMPLETOS',
        descricao: 'Nome is missing'
      });
      
      await createValidationIssue(
        id_unico, 
        'DADOS_INCOMPLETOS', 
        'Nome is missing'
      );
    }
    
    if (!empregador || empregador === '-') {
      results.isValid = false;
      results.issues.push({
        tipo_validacao: 'DADOS_INCOMPLETOS',
        descricao: 'Empregador is missing'
      });
      
      await createValidationIssue(
        id_unico, 
        'DADOS_INCOMPLETOS', 
        'Empregador is missing'
      );
    }
    
    return results;
    
  } catch (error) {
    logger.error(`Error validating proposal: ${error.message}`);
    results.isValid = false;
    results.issues.push({
      tipo_validacao: 'ERRO_SISTEMA',
      descricao: `System error: ${error.message}`
    });
    return results;
  }
};

/**
 * Map employer name to logo ID
 * @param {string} empregador - Employer name
 * @returns {number} - Logo ID
 */
const mapEmpregadorToLogo = (empregador) => {
  if (!empregador) return 3; // Default
  
  const mapping = {
    'GOV GOIAS SEG': 31,
    'INSS BENEF SEG': 61,
    'INSS RMC SEG': 71
  };
  
  return mapping[empregador.toUpperCase()] || 3;
};

module.exports = {
  checkProposalExists,
  checkForDuplicates,
  createValidationIssue,
  resolveValidationIssue,
  getValidationIssues,
  getUnresolvedIssues,
  validateProposal,
  mapEmpregadorToLogo
};