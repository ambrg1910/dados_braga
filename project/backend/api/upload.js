const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { sequelize } = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow Excel files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

/**
 * @route   POST /api/upload/spreadsheet
 * @desc    Upload and process a spreadsheet
 * @access  Private
 */
router.post('/spreadsheet', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' }
      });
    }

    const { type } = req.body;
    
    if (!type || !['PROD_PROM', 'ESTEIRA', 'OP_REALIZADAS', 'SEGUROS', 'FACE_SHEET'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid spreadsheet type' }
      });
    }

    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: null });

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Spreadsheet is empty' }
      });
    }

    // Process the data based on the type
    const result = await processSpreadsheet(data, type, req.user.id);

    // Log the upload action
    await sequelize.query(
      'INSERT INTO historico (operador_id, acao, descricao, ip_address) VALUES (?, ?, ?, ?)',
      { 
        replacements: [
          req.user.id, 
          'UPLOAD', 
          `User ${req.user.usuario} uploaded ${type} spreadsheet with ${data.length} rows`, 
          req.ip
        ],
        type: sequelize.QueryTypes.INSERT 
      }
    );

    res.json({
      success: true,
      data: {
        message: 'Spreadsheet processed successfully',
        filename: req.file.filename,
        rowCount: data.length,
        type,
        stats: result
      }
    });
  } catch (error) {
    logger.error(`Spreadsheet upload error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { message: `Error processing spreadsheet: ${error.message}` }
    });
  }
});

/**
 * @route   POST /api/upload/validate
 * @desc    Validate a spreadsheet against the database
 * @access  Private
 */
router.post('/validate', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' }
      });
    }

    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: null });

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Spreadsheet is empty' }
      });
    }

    // Validate the data against the database
    const result = await validateSpreadsheet(data, req.user.id);

    // Create a new workbook with the validated data
    const newWorkbook = xlsx.utils.book_new();
    const newWorksheet = xlsx.utils.json_to_sheet(result.validatedData);
    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Validated');

    // Save the new workbook
    const validatedFilePath = path.join(
      process.env.UPLOAD_DIR || './uploads',
      `validated-${Date.now()}.xlsx`
    );
    xlsx.writeFile(newWorkbook, validatedFilePath);

    // Log the validation action
    await sequelize.query(
      'INSERT INTO historico (operador_id, acao, descricao, ip_address) VALUES (?, ?, ?, ?)',
      { 
        replacements: [
          req.user.id, 
          'VALIDATION', 
          `User ${req.user.usuario} validated spreadsheet with ${data.length} rows`, 
          req.ip
        ],
        type: sequelize.QueryTypes.INSERT 
      }
    );

    res.json({
      success: true,
      data: {
        message: 'Spreadsheet validated successfully',
        filename: path.basename(validatedFilePath),
        downloadUrl: `/uploads/${path.basename(validatedFilePath)}`,
        rowCount: data.length,
        stats: {
          validated: result.stats.validated,
          notFound: result.stats.notFound,
          duplicates: result.stats.duplicates,
          errors: result.stats.errors
        }
      }
    });
  } catch (error) {
    logger.error(`Spreadsheet validation error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { message: `Error validating spreadsheet: ${error.message}` }
    });
  }
});

/**
 * Process spreadsheet data based on type
 * @param {Array} data - The spreadsheet data
 * @param {String} type - The type of spreadsheet
 * @param {Number} operatorId - The ID of the operator who uploaded the file
 * @returns {Object} Processing statistics
 */
async function processSpreadsheet(data, type, operatorId) {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    let inserted = 0;
    let updated = 0;
    let duplicates = 0;
    let errors = 0;
    
    // Get operator info
    const [operator] = await sequelize.query(
      'SELECT nome FROM operadores WHERE id = ?',
      { 
        replacements: [operatorId],
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    // Process each row
    for (const row of data) {
      try {
        // Extract CPF and Matricula based on spreadsheet type
        let cpf, matricula, idUnico;
        
        switch (type) {
          case 'PROD_PROM':
            cpf = row.CPF || row.cpf || '';
            matricula = row.MATRICULA || row.matricula || '';
            break;
          case 'ESTEIRA':
            cpf = row.CPF || row.cpf || '';
            matricula = row.MATRICULA || row.matricula || '';
            break;
          case 'OP_REALIZADAS':
            cpf = row.CPF || row.cpf || '';
            matricula = row.MATRICULA || row.matricula || '';
            break;
          case 'SEGUROS':
            cpf = row.CPF || row.cpf || '';
            matricula = row.MATRICULA || row.matricula || '';
            break;
          case 'FACE_SHEET':
            cpf = row.CPF || row.cpf || '';
            matricula = row.MATRICULA || row.matricula || '';
            break;
          default:
            throw new Error(`Unknown spreadsheet type: ${type}`);
        }
        
        // Clean and validate CPF and Matricula
        cpf = (cpf || '').toString().trim();
        matricula = (matricula || '').toString().trim();
        
        if (!cpf || !matricula) {
          errors++;
          continue;
        }
        
        // Create unique identifier
        idUnico = `${cpf}${matricula}`;
        
        // Check if proposal already exists
        const [existingProposal] = await sequelize.query(
          'SELECT id FROM esteira_propostas WHERE id_unico = ?',
          { 
            replacements: [idUnico],
            type: sequelize.QueryTypes.SELECT,
            transaction
          }
        );
        
        // Prepare data for insertion/update
        const proposalData = {
          id_unico: idUnico,
          cpf,
          matricula,
          nome: row.NOME || row.nome || '-',
          empregador: row.EMPREGADOR || row.empregador || '-',
          operador: operator.nome,
          origem_dados: type
        };
        
        // Add type-specific fields
        switch (type) {
          case 'PROD_PROM':
            proposalData.proposta30 = row.PROPOSTA30 || row.proposta30 || '-';
            proposalData.digitado = 'DIGITADO';
            break;
          case 'ESTEIRA':
            // Handle specific fields for ESTEIRA
            break;
          case 'OP_REALIZADAS':
            // Handle specific fields for OP_REALIZADAS
            break;
          case 'SEGUROS':
            // Handle specific fields for SEGUROS
            break;
          case 'FACE_SHEET':
            // Handle specific fields for FACE_SHEET
            break;
        }
        
        // Set logo based on employer
        if (proposalData.empregador) {
          const [employerLogo] = await sequelize.query(
            'SELECT logo FROM empregadores WHERE nome = ?',
            { 
              replacements: [proposalData.empregador],
              type: sequelize.QueryTypes.SELECT,
              transaction
            }
          );
          
          if (employerLogo) {
            proposalData.logo = employerLogo.logo;
          } else if (proposalData.empregador === 'GOV GOIAS SEG') {
            proposalData.logo = 31;
          } else if (proposalData.empregador === 'INSS BENEF SEG') {
            proposalData.logo = 61;
          } else if (proposalData.empregador === 'INSS RMC SEG') {
            proposalData.logo = 71;
          } else {
            // Default logos
            proposalData.logo = [3, 6, 7][Math.floor(Math.random() * 3)];
          }
        }
        
        // Insert or update proposal
        if (existingProposal) {
          // Update existing proposal
          if (type === 'PROD_PROM') {
            // For PROD_PROM, update only proposta30 and digitado
            await sequelize.query(
              'UPDATE esteira_propostas SET proposta30 = ?, digitado = ?, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id_unico = ?',
              { 
                replacements: [proposalData.proposta30, proposalData.digitado, idUnico],
                type: sequelize.QueryTypes.UPDATE,
                transaction
              }
            );
          } else {
            // For other types, don't update if already exists
            duplicates++;
            continue;
          }
          
          updated++;
        } else {
          // Insert new proposal
          await sequelize.query(
            `INSERT INTO esteira_propostas 
            (id_unico, cpf, matricula, nome, proposta30, digitado, empregador, logo, operador, origem_dados) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            { 
              replacements: [
                proposalData.id_unico,
                proposalData.cpf,
                proposalData.matricula,
                proposalData.nome,
                proposalData.proposta30 || '-',
                proposalData.digitado || 'NÃO DIGITADO',
                proposalData.empregador,
                proposalData.logo,
                proposalData.operador,
                proposalData.origem_dados
              ],
              type: sequelize.QueryTypes.INSERT,
              transaction
            }
          );
          
          inserted++;
        }
      } catch (error) {
        logger.error(`Error processing row: ${error.message}`, { row });
        errors++;
      }
    }
    
    // Commit transaction
    await transaction.commit();
    
    // Update operator stats
    await sequelize.query(
      'UPDATE operadores SET propostas_validadas = propostas_validadas + ? WHERE id = ?',
      { 
        replacements: [inserted + updated, operatorId],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    return {
      inserted,
      updated,
      duplicates,
      errors
    };
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    throw error;
  }
}

/**
 * Validate spreadsheet data against the database
 * @param {Array} data - The spreadsheet data
 * @param {Number} operatorId - The ID of the operator who uploaded the file
 * @returns {Object} Validation results and statistics
 */
async function validateSpreadsheet(data, operatorId) {
  const validatedData = [];
  const stats = {
    validated: 0,
    notFound: 0,
    duplicates: 0,
    errors: 0
  };
  
  // Process each row
  for (const row of data) {
    try {
      // Extract CPF and Matricula
      const cpf = (row.CPF || row.cpf || '').toString().trim();
      const matricula = (row.MATRICULA || row.matricula || '').toString().trim();
      
      if (!cpf || !matricula) {
        // Add validation error
        row.PROPOSTA30 = '-';
        row.DIGITADO = 'ERRO';
        row.VALIDACAO = 'CPF ou Matrícula inválidos';
        validatedData.push(row);
        stats.errors++;
        continue;
      }
      
      // Create unique identifier
      const idUnico = `${cpf}${matricula}`;
      
      // Check if proposal exists in database
      const [proposal] = await sequelize.query(
        'SELECT proposta30, digitado, situacao, extrator, utilizacao FROM esteira_propostas WHERE id_unico = ?',
        { 
          replacements: [idUnico],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      // Check for duplicates in the current data
      const duplicateIndex = validatedData.findIndex(item => 
        (item.CPF || item.cpf) === cpf && (item.MATRICULA || item.matricula) === matricula
      );
      
      if (duplicateIndex !== -1) {
        // Mark as duplicate
        row.PROPOSTA30 = row.PROPOSTA30 || '-';
        row.DIGITADO = 'DUPLICADO';
        row.VALIDACAO = 'Duplicado neste arquivo';
        validatedData.push(row);
        stats.duplicates++;
        continue;
      }
      
      if (proposal) {
        // Proposal found in database
        row.PROPOSTA30 = proposal.proposta30;
        row.DIGITADO = proposal.digitado;
        row.SITUACAO = proposal.situacao;
        row.EXTRATOR = proposal.extrator;
        row.UTILIZACAO = proposal.utilizacao;
        row.VALIDACAO = 'Validado';
        validatedData.push(row);
        stats.validated++;
      } else {
        // Proposal not found
        row.PROPOSTA30 = '-';
        row.DIGITADO = 'NÃO DIGITADO';
        row.VALIDACAO = 'Não encontrado na base';
        validatedData.push(row);
        stats.notFound++;
      }
    } catch (error) {
      logger.error(`Error validating row: ${error.message}`, { row });
      row.PROPOSTA30 = '-';
      row.DIGITADO = 'ERRO';
      row.VALIDACAO = `Erro: ${error.message}`;
      validatedData.push(row);
      stats.errors++;
    }
  }
  
  return {
    validatedData,
    stats
  };
}

module.exports = router;