const express = require('express');
const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { EsteiraPropostas, Validacoes, Operadores } = require('../models');

/**
 * @route POST /api/reports/generate
 * @desc Generate a report based on filters
 * @access Private
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      empregador,
      logo,
      operadorId,
      digitado,
      format // 'excel' or 'pdf'
    } = req.body;

    // Build where clause for proposals
    const whereClause = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereClause.createdAt = { [Op.lte]: new Date(endDate) };
    }

    if (empregador) {
      whereClause.empregador = { [Op.iLike]: `%${empregador}%` };
    }

    if (logo) {
      whereClause.logo = logo;
    }

    if (digitado !== undefined) {
      whereClause.digitado = digitado;
    }

    // Get proposals based on filters
    const proposals = await EsteiraPropostas.findAll({
      where: whereClause,
      include: [{
        model: Validacoes,
        as: 'validacoes',
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    // Get summary statistics
    const totalProposals = proposals.length;
    const digitizedProposals = proposals.filter(p => p.digitado).length;
    const nonDigitizedProposals = proposals.filter(p => !p.digitado).length;
    
    // Count validation issues
    const validationIssues = proposals.reduce((count, proposal) => {
      return count + (proposal.validacoes ? proposal.validacoes.length : 0);
    }, 0);

    // Group by employer
    const employerBreakdown = proposals.reduce((acc, proposal) => {
      const empregador = proposal.empregador || 'Não informado';
      if (!acc[empregador]) {
        acc[empregador] = 0;
      }
      acc[empregador]++;
      return acc;
    }, {});

    // Group by logo
    const logoBreakdown = proposals.reduce((acc, proposal) => {
      const logo = proposal.logo || 'Não informado';
      if (!acc[logo]) {
        acc[logo] = 0;
      }
      acc[logo]++;
      return acc;
    }, {});

    // Get validation breakdown by type
    const validationTypes = {};
    proposals.forEach(proposal => {
      if (proposal.validacoes && proposal.validacoes.length > 0) {
        proposal.validacoes.forEach(validation => {
          const tipo = validation.tipo || 'Não informado';
          if (!validationTypes[tipo]) {
            validationTypes[tipo] = 0;
          }
          validationTypes[tipo]++;
        });
      }
    });

    // Prepare report data
    const reportData = {
      filters: {
        startDate,
        endDate,
        empregador,
        logo,
        operadorId,
        digitado
      },
      summary: {
        totalProposals,
        digitizedProposals,
        nonDigitizedProposals,
        validationIssues
      },
      breakdowns: {
        employerBreakdown,
        logoBreakdown,
        validationTypes
      },
      proposals: proposals.map(p => ({
        id: p.id,
        cpf: p.cpf,
        matricula: p.matricula,
        nome: p.nome,
        empregador: p.empregador,
        logo: p.logo,
        situacao: p.situacao,
        digitado: p.digitado,
        createdAt: p.createdAt,
        validacoes: p.validacoes ? p.validacoes.length : 0
      }))
    };

    // Generate report in requested format
    if (format === 'excel') {
      return generateExcelReport(reportData, res);
    } else if (format === 'pdf') {
      return generatePDFReport(reportData, res);
    } else {
      // Default to JSON if format not specified
      res.json(reportData);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório.' });
  }
});

/**
 * Generate Excel report
 * @param {Object} reportData - Report data
 * @param {Object} res - Express response object
 */
async function generateExcelReport(reportData, res) {
  const workbook = new ExcelJS.Workbook();
  
  // Add summary sheet
  const summarySheet = workbook.addWorksheet('Resumo');
  
  // Add title
  summarySheet.addRow(['Relatório de Propostas']);
  summarySheet.addRow(['Data de geração:', new Date().toLocaleString('pt-BR')]);
  summarySheet.addRow([]);
  
  // Add filters section
  summarySheet.addRow(['Filtros aplicados:']);
  if (reportData.filters.startDate) {
    summarySheet.addRow(['Data inicial:', new Date(reportData.filters.startDate).toLocaleDateString('pt-BR')]);
  }
  if (reportData.filters.endDate) {
    summarySheet.addRow(['Data final:', new Date(reportData.filters.endDate).toLocaleDateString('pt-BR')]);
  }
  if (reportData.filters.empregador) {
    summarySheet.addRow(['Empregador:', reportData.filters.empregador]);
  }
  if (reportData.filters.logo) {
    summarySheet.addRow(['Logo:', reportData.filters.logo]);
  }
  if (reportData.filters.digitado !== undefined) {
    summarySheet.addRow(['Digitado:', reportData.filters.digitado ? 'Sim' : 'Não']);
  }
  summarySheet.addRow([]);
  
  // Add summary statistics
  summarySheet.addRow(['Resumo:']);
  summarySheet.addRow(['Total de propostas:', reportData.summary.totalProposals]);
  summarySheet.addRow(['Propostas digitadas:', reportData.summary.digitizedProposals]);
  summarySheet.addRow(['Propostas não digitadas:', reportData.summary.nonDigitizedProposals]);
  summarySheet.addRow(['Problemas de validação:', reportData.summary.validationIssues]);
  summarySheet.addRow([]);
  
  // Add employer breakdown
  summarySheet.addRow(['Distribuição por empregador:']);
  Object.entries(reportData.breakdowns.employerBreakdown).forEach(([empregador, count]) => {
    summarySheet.addRow([empregador, count]);
  });
  summarySheet.addRow([]);
  
  // Add logo breakdown
  summarySheet.addRow(['Distribuição por logo:']);
  Object.entries(reportData.breakdowns.logoBreakdown).forEach(([logo, count]) => {
    summarySheet.addRow([logo, count]);
  });
  summarySheet.addRow([]);
  
  // Add validation types breakdown
  summarySheet.addRow(['Distribuição por tipo de validação:']);
  Object.entries(reportData.breakdowns.validationTypes).forEach(([tipo, count]) => {
    summarySheet.addRow([tipo, count]);
  });
  
  // Add proposals sheet
  const proposalsSheet = workbook.addWorksheet('Propostas');
  
  // Add headers
  proposalsSheet.addRow([
    'ID', 'CPF', 'Matrícula', 'Nome', 'Empregador', 'Logo', 
    'Situação', 'Digitado', 'Data de Criação', 'Validações'
  ]);
  
  // Add data rows
  reportData.proposals.forEach(proposal => {
    proposalsSheet.addRow([
      proposal.id,
      proposal.cpf,
      proposal.matricula,
      proposal.nome,
      proposal.empregador,
      proposal.logo,
      proposal.situacao,
      proposal.digitado ? 'Sim' : 'Não',
      new Date(proposal.createdAt).toLocaleString('pt-BR'),
      proposal.validacoes
    ]);
  });
  
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=relatorio-propostas.xlsx');
  
  // Write to response
  await workbook.xlsx.write(res);
}

/**
 * Generate PDF report
 * @param {Object} reportData - Report data
 * @param {Object} res - Express response object
 */
function generatePDFReport(reportData, res) {
  const doc = new PDFDocument();
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=relatorio-propostas.pdf');
  
  // Pipe PDF to response
  doc.pipe(res);
  
  // Add title
  doc.fontSize(18).text('Relatório de Propostas', { align: 'center' });
  doc.fontSize(12).text(`Data de geração: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
  doc.moveDown(2);
  
  // Add filters section
  doc.fontSize(14).text('Filtros aplicados:', { underline: true });
  doc.fontSize(12);
  if (reportData.filters.startDate) {
    doc.text(`Data inicial: ${new Date(reportData.filters.startDate).toLocaleDateString('pt-BR')}`);
  }
  if (reportData.filters.endDate) {
    doc.text(`Data final: ${new Date(reportData.filters.endDate).toLocaleDateString('pt-BR')}`);
  }
  if (reportData.filters.empregador) {
    doc.text(`Empregador: ${reportData.filters.empregador}`);
  }
  if (reportData.filters.logo) {
    doc.text(`Logo: ${reportData.filters.logo}`);
  }
  if (reportData.filters.digitado !== undefined) {
    doc.text(`Digitado: ${reportData.filters.digitado ? 'Sim' : 'Não'}`);
  }
  doc.moveDown(2);
  
  // Add summary statistics
  doc.fontSize(14).text('Resumo:', { underline: true });
  doc.fontSize(12);
  doc.text(`Total de propostas: ${reportData.summary.totalProposals}`);
  doc.text(`Propostas digitadas: ${reportData.summary.digitizedProposals}`);
  doc.text(`Propostas não digitadas: ${reportData.summary.nonDigitizedProposals}`);
  doc.text(`Problemas de validação: ${reportData.summary.validationIssues}`);
  doc.moveDown(2);
  
  // Add employer breakdown
  doc.fontSize(14).text('Distribuição por empregador:', { underline: true });
  doc.fontSize(12);
  Object.entries(reportData.breakdowns.employerBreakdown).forEach(([empregador, count]) => {
    doc.text(`${empregador}: ${count}`);
  });
  doc.moveDown(2);
  
  // Add logo breakdown
  doc.fontSize(14).text('Distribuição por logo:', { underline: true });
  doc.fontSize(12);
  Object.entries(reportData.breakdowns.logoBreakdown).forEach(([logo, count]) => {
    doc.text(`${logo}: ${count}`);
  });
  doc.moveDown(2);
  
  // Add validation types breakdown
  doc.fontSize(14).text('Distribuição por tipo de validação:', { underline: true });
  doc.fontSize(12);
  Object.entries(reportData.breakdowns.validationTypes).forEach(([tipo, count]) => {
    doc.text(`${tipo}: ${count}`);
  });
  doc.moveDown(2);
  
  // Add proposals table (simplified due to PDF limitations)
  doc.fontSize(14).text('Propostas:', { underline: true });
  doc.fontSize(10);
  
  // Add table headers
  const tableTop = doc.y + 10;
  const tableHeaders = ['CPF', 'Nome', 'Empregador', 'Situação', 'Digitado'];
  const columnWidth = 100;
  
  // Draw headers
  tableHeaders.forEach((header, i) => {
    doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'left' });
  });
  
  // Draw horizontal line
  doc.moveTo(50, tableTop + 20)
     .lineTo(50 + (tableHeaders.length * columnWidth), tableTop + 20)
     .stroke();
  
  // Draw data rows (limit to first 20 for PDF readability)
  const limitedProposals = reportData.proposals.slice(0, 20);
  limitedProposals.forEach((proposal, i) => {
    const rowTop = tableTop + 30 + (i * 20);
    
    doc.text(proposal.cpf, 50, rowTop, { width: columnWidth, align: 'left' });
    doc.text(proposal.nome, 50 + columnWidth, rowTop, { width: columnWidth, align: 'left' });
    doc.text(proposal.empregador, 50 + (2 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
    doc.text(proposal.situacao, 50 + (3 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
    doc.text(proposal.digitado ? 'Sim' : 'Não', 50 + (4 * columnWidth), rowTop, { width: columnWidth, align: 'left' });
  });
  
  // Add note if there are more proposals
  if (reportData.proposals.length > 20) {
    doc.moveDown(2);
    doc.text(`Nota: Exibindo apenas 20 de ${reportData.proposals.length} propostas. Para visualizar todas, exporte para Excel.`);
  }
  
  // Finalize PDF
  doc.end();
}

module.exports = router;