const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { EsteiraPropostas, Validacoes, Operadores, Historico } = require('../models');
const logger = require('../utils/logger');
const { sequelize } = require('../config/database');

/**
 * Map employer names to logo IDs according to business rules
 * @param {string} empregador - Employer name
 * @returns {number} - Logo ID
 */
const mapEmpregadorToLogo = (empregador) => {
  const mapping = {
    'GOV GOIAS SEG': 31,
    'INSS BENEF SEG': 61,
    'INSS RMC SEG': 71
  };

  return mapping[empregador] || 3; // Default to 3 if not found
};

/**
 * Clean data according to business rules
 * @param {*} value - Value to clean
 * @param {string} type - Type of data (number, text, date)
 * @returns {*} - Cleaned value
 */
const cleanData = (value, type) => {
  if (value === null || value === undefined || value === '') {
    switch (type) {
      case 'number':
        return 0;
      case 'text':
        return '-';
      case 'date':
        return '1900-01-01';
      default:
        return '-';
    }
  }
  return value;
};

/**
 * Generate a unique ID by combining CPF and Matricula
 * @param {string} cpf - CPF number
 * @param {string} matricula - Matricula number
 * @returns {string} - Unique ID
 */
const generateUniqueId = (cpf, matricula) => {
  return `${cleanData(cpf, 'text')}_${cleanData(matricula, 'text')}`;
};

/**
 * Process a spreadsheet and insert/update records in the database
 * @param {string} filePath - Path to the spreadsheet file
 * @param {string} spreadsheetType - Type of spreadsheet (PROD_PROM, ESTEIRA, etc)
 * @param {number} operadorId - ID of the operator who uploaded the file
 * @returns {Object} - Processing results
 */
const processSpreadsheet = async (filePath, spreadsheetType, operadorId) => {
  const transaction = await sequelize.transaction();
  
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    logger.info(`Processing ${data.length} rows from ${spreadsheetType} spreadsheet`);
    
    const results = {
      total: data.length,
      inserted: 0,
      updated: 0,
      errors: 0,
      validationIssues: 0
    };
    
    // Get operator info for logging
    const operator = await Operadores.findByPk(operadorId);
    
    // Process each row in the spreadsheet
    for (const row of data) {
      try {
        // Extract and clean data based on spreadsheet type
        let cpf, matricula, nome, empregador, proposta30, valor_contrato, valor_parcela, prazo;
        
        switch (spreadsheetType) {
          case 'PROD_PROM':
            cpf = cleanData(row.CPF || row.cpf, 'text');
            matricula = cleanData(row.MATRICULA || row.matricula, 'text');
            nome = cleanData(row.NOME || row.nome, 'text');
            empregador = cleanData(row.EMPREGADOR || row.empregador, 'text');
            proposta30 = cleanData(row.PROPOSTA30 || row.proposta30, 'text');
            valor_contrato = cleanData(row.VALOR_CONTRATO || row.valor_contrato, 'number');
            valor_parcela = cleanData(row.VALOR_PARCELA || row.valor_parcela, 'number');
            prazo = cleanData(row.PRAZO || row.prazo, 'number');
            break;
            
          case 'ESTEIRA':
            cpf = cleanData(row.CPF || row.cpf, 'text');
            matricula = cleanData(row.MATRICULA || row.matricula, 'text');
            nome = cleanData(row.NOME || row.nome, 'text');
            empregador = cleanData(row.EMPREGADOR || row.empregador, 'text');
            proposta30 = cleanData(row.PROPOSTA30 || row.proposta30, 'text');
            valor_contrato = cleanData(row.VALOR_CONTRATO || row.valor_contrato, 'number');
            valor_parcela = cleanData(row.VALOR_PARCELA || row.valor_parcela, 'number');
            prazo = cleanData(row.PRAZO || row.prazo, 'number');
            break;
            
          case 'OP_REALIZADAS':
            cpf = cleanData(row.CPF || row.cpf, 'text');
            matricula = cleanData(row.MATRICULA || row.matricula, 'text');
            nome = cleanData(row.NOME || row.nome, 'text');
            empregador = cleanData(row.EMPREGADOR || row.empregador, 'text');
            proposta30 = cleanData(row.PROPOSTA30 || row.proposta30, 'text');
            valor_contrato = cleanData(row.VALOR_CONTRATO || row.valor_contrato, 'number');
            valor_parcela = cleanData(row.VALOR_PARCELA || row.valor_parcela, 'number');
            prazo = cleanData(row.PRAZO || row.prazo, 'number');
            break;
            
          case 'SEGUROS':
            cpf = cleanData(row.CPF || row.cpf, 'text');
            matricula = cleanData(row.MATRICULA || row.matricula, 'text');
            nome = cleanData(row.NOME || row.nome, 'text');
            empregador = cleanData(row.EMPREGADOR || row.empregador, 'text');
            proposta30 = cleanData(row.PROPOSTA30 || row.proposta30, 'text');
            valor_contrato = cleanData(row.VALOR_CONTRATO || row.valor_contrato, 'number');
            valor_parcela = cleanData(row.VALOR_PARCELA || row.valor_parcela, 'number');
            prazo = cleanData(row.PRAZO || row.prazo, 'number');
            break;
            
          default:
            // Try to extract common fields
            cpf = cleanData(row.CPF || row.cpf, 'text');
            matricula = cleanData(row.MATRICULA || row.matricula, 'text');
            nome = cleanData(row.NOME || row.nome, 'text');
            empregador = cleanData(row.EMPREGADOR || row.empregador, 'text');
            proposta30 = cleanData(row.PROPOSTA30 || row.proposta30, 'text');
            valor_contrato = cleanData(row.VALOR_CONTRATO || row.valor_contrato, 'number');
            valor_parcela = cleanData(row.VALOR_PARCELA || row.valor_parcela, 'number');
            prazo = cleanData(row.PRAZO || row.prazo, 'number');
        }
        
        // Generate unique ID
        const id_unico = generateUniqueId(cpf, matricula);
        
        // Map employer to logo
        const logo = mapEmpregadorToLogo(empregador);
        
        // Check if record already exists
        const existingRecord = await EsteiraPropostas.findOne({
          where: { id_unico },
          transaction
        });
        
        if (existingRecord) {
          // Update existing record
          // Only update proposta30 and digitado status, preserve manual fields
          await existingRecord.update({
            proposta30: proposta30 !== '-' ? proposta30 : existingRecord.proposta30,
            digitado: proposta30 !== '-' ? 'DIGITADO' : existingRecord.digitado,
            // Do not update situacao, extrator, utilizacao if they were manually set
          }, { transaction });
          
          results.updated++;
          
          // Log the update
          await Historico.create({
            operador_id: operadorId,
            acao: 'UPDATE',
            descricao: `Updated proposal ${id_unico} from ${spreadsheetType}`,
            data_hora: new Date()
          }, { transaction });
          
        } else {
          // Insert new record
          await EsteiraPropostas.create({
            id_unico,
            cpf,
            matricula,
            nome,
            empregador,
            logo,
            proposta30,
            digitado: proposta30 !== '-' ? 'DIGITADO' : 'NÃO DIGITADO',
            situacao: '-',
            extrator: '-',
            utilizacao: '-',
            valor_contrato,
            valor_parcela,
            prazo,
            data_importacao: new Date(),
            operador: operator.nome,
            fonte_dados: spreadsheetType
          }, { transaction });
          
          results.inserted++;
          
          // Log the insert
          await Historico.create({
            operador_id: operadorId,
            acao: 'INSERT',
            descricao: `Inserted new proposal ${id_unico} from ${spreadsheetType}`,
            data_hora: new Date()
          }, { transaction });
        }
        
        // Check for duplicates in other records
        const duplicates = await EsteiraPropostas.count({
          where: { id_unico },
          transaction
        });
        
        if (duplicates > 1) {
          // Create validation issue for duplicate
          await Validacoes.create({
            id_unico,
            tipo_validacao: 'DUPLICADO',
            descricao: `Duplicate record found in ${spreadsheetType}`,
            resolvido: false,
            data_validacao: new Date()
          }, { transaction });
          
          results.validationIssues++;
        }
        
      } catch (rowError) {
        results.errors++;
        logger.error(`Error processing row: ${rowError.message}`);
      }
    }
    
    // Update operator statistics
    await operator.increment('propostas_validadas', { 
      by: results.inserted + results.updated,
      transaction 
    });
    
    if (results.errors > 0) {
      await operator.increment('propostas_com_erro', { 
        by: results.errors,
        transaction 
      });
    }
    
    // Calculate and update operator score
    const totalProcessed = results.inserted + results.updated;
    const errorRate = totalProcessed > 0 ? results.errors / totalProcessed : 0;
    const score = Math.round(100 * (1 - errorRate));
    
    await operator.update({ score }, { transaction });
    
    // Log the upload action
    await Historico.create({
      operador_id: operadorId,
      acao: 'UPLOAD',
      descricao: `Uploaded ${spreadsheetType} with ${results.total} rows. Inserted: ${results.inserted}, Updated: ${results.updated}, Errors: ${results.errors}`,
      data_hora: new Date()
    }, { transaction });
    
    await transaction.commit();
    return results;
    
  } catch (error) {
    await transaction.rollback();
    logger.error(`Spreadsheet processing error: ${error.message}`);
    throw error;
  }
};

/**
 * Validate a spreadsheet against the database
 * @param {string} filePath - Path to the spreadsheet file
 * @param {number} operadorId - ID of the operator who uploaded the file
 * @returns {Object} - Validation results and path to output file
 */
const validateSpreadsheet = async (filePath, operadorId) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    logger.info(`Validating ${data.length} rows from spreadsheet`);
    
    const results = {
      total: data.length,
      validated: 0,
      notFound: 0,
      errors: 0
    };
    
    // Get operator info for logging
    const operator = await Operadores.findByPk(operadorId);
    
    // Create a new workbook for validation results
    const validationWorkbook = xlsx.utils.book_new();
    const validationData = [];
    
    // Process each row in the spreadsheet
    for (const row of data) {
      try {
        // Extract CPF and Matricula
        const cpf = cleanData(row.CPF || row.cpf, 'text');
        const matricula = cleanData(row.MATRICULA || row.matricula, 'text');
        
        // Generate unique ID
        const id_unico = generateUniqueId(cpf, matricula);
        
        // Check if record exists in database
        const existingRecord = await EsteiraPropostas.findOne({
          where: { id_unico }
        });
        
        // Create validation result row
        const resultRow = { ...row };
        
        if (existingRecord) {
          // Record found, add validation info
          resultRow.VALIDADO = 'SIM';
          resultRow.PROPOSTA30 = existingRecord.proposta30;
          resultRow.DIGITADO = existingRecord.digitado;
          resultRow.SITUACAO = existingRecord.situacao;
          resultRow.EXTRATOR = existingRecord.extrator;
          resultRow.UTILIZACAO = existingRecord.utilizacao;
          
          results.validated++;
          
        } else {
          // Record not found
          resultRow.VALIDADO = 'NÃO';
          resultRow.PROPOSTA30 = '-';
          resultRow.DIGITADO = 'NÃO DIGITADO';
          resultRow.SITUACAO = '-';
          resultRow.EXTRATOR = '-';
          resultRow.UTILIZACAO = '-';
          
          results.notFound++;
          
          // Create validation issue for not found
          await Validacoes.create({
            id_unico,
            tipo_validacao: 'NAO_ENCONTRADO',
            descricao: `Record not found in database`,
            resolvido: false,
            data_validacao: new Date()
          });
        }
        
        // Check for validation issues
        const validationIssues = await Validacoes.findAll({
          where: { id_unico, resolvido: false }
        });
        
        if (validationIssues.length > 0) {
          resultRow.PROBLEMAS = validationIssues.map(issue => 
            `${issue.tipo_validacao}: ${issue.descricao}`
          ).join('; ');
        } else {
          resultRow.PROBLEMAS = '-';
        }
        
        validationData.push(resultRow);
        
      } catch (rowError) {
        results.errors++;
        logger.error(`Error validating row: ${rowError.message}`);
      }
    }
    
    // Create validation worksheet
    const validationWorksheet = xlsx.utils.json_to_sheet(validationData);
    xlsx.utils.book_append_sheet(validationWorkbook, validationWorksheet, 'Validation Results');
    
    // Save validation workbook
    const outputDir = path.join(__dirname, '..', '..', 'uploads', 'validations');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(outputDir, `validation_${timestamp}.xlsx`);
    
    xlsx.writeFile(validationWorkbook, outputPath);
    
    // Log the validation action
    await Historico.create({
      operador_id: operadorId,
      acao: 'VALIDACAO',
      descricao: `Validated spreadsheet with ${results.total} rows. Found: ${results.validated}, Not Found: ${results.notFound}, Errors: ${results.errors}`,
      data_hora: new Date()
    });
    
    // Update operator statistics
    await operator.increment('propostas_validadas', { by: results.validated });
    
    if (results.notFound > 0 || results.errors > 0) {
      await operator.increment('propostas_com_erro', { 
        by: results.notFound + results.errors
      });
    }
    
    // Calculate and update operator score
    const totalProcessed = results.validated + results.notFound;
    const errorRate = totalProcessed > 0 ? 
      (results.notFound + results.errors) / totalProcessed : 0;
    const score = Math.round(100 * (1 - errorRate));
    
    await operator.update({ score });
    
    return {
      results,
      outputPath: outputPath.replace(/\\/g, '/')
    };
    
  } catch (error) {
    logger.error(`Spreadsheet validation error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  processSpreadsheet,
  validateSpreadsheet,
  mapEmpregadorToLogo,
  cleanData,
  generateUniqueId
};