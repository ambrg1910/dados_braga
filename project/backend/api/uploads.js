const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { processSpreadsheet, validateSpreadsheet } = require('../services/spreadsheetService');
const { checkAdmin } = require('../middleware/checkAdmin');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = uuidv4();
    cb(null, `${uniquePrefix}-${file.originalname}`);
  }
});

// File filter to accept only Excel and CSV files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado. Por favor, envie arquivos Excel (.xlsx, .xls) ou CSV.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @route POST /api/uploads/spreadsheet
 * @desc Upload and process a spreadsheet
 * @access Private (Admin only)
 */
router.post('/spreadsheet', checkAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
    }

    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ message: 'O tipo de planilha é obrigatório.' });
    }

    const allowedTypes = ['PROD_PROM', 'ESTEIRA', 'OP_REALIZADAS', 'SEGUROS'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Tipo de planilha inválido.' });
    }

    const filePath = req.file.path;
    const operadorId = req.user.id;

    // Process the spreadsheet
    const result = await processSpreadsheet(filePath, type, operadorId);

    res.status(200).json({
      message: 'Planilha processada com sucesso.',
      result
    });
  } catch (error) {
    console.error('Error uploading spreadsheet:', error);
    res.status(500).json({ 
      message: 'Erro ao processar planilha.', 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/uploads/validate
 * @desc Validate a spreadsheet against existing records
 * @access Private
 */
router.post('/validate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
    }

    const filePath = req.file.path;
    const operadorId = req.user.id;

    // Validate the spreadsheet
    const result = await validateSpreadsheet(filePath, operadorId);

    // Return the path to the validation results file
    res.status(200).json({
      message: 'Planilha validada com sucesso.',
      filename: path.basename(result.outputFilePath),
      originalname: `validacao-${path.basename(req.file.originalname)}`,
      validatedCount: result.validatedCount,
      notFoundCount: result.notFoundCount
    });
  } catch (error) {
    console.error('Error validating spreadsheet:', error);
    res.status(500).json({ 
      message: 'Erro ao validar planilha.', 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/uploads/:filename
 * @desc Download a file from the uploads directory
 * @access Private
 */
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado.' });
    }

    // Send the file
    res.download(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ 
      message: 'Erro ao baixar arquivo.', 
      error: error.message 
    });
  }
});

module.exports = router;