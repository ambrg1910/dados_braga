import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ptBR } from 'date-fns/locale';
import {
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { reportsAPI } from '../services/api';

const Reports = () => {
  // State for report filters
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    empregador: '',
    logo: '',
    operador: '',
    digitado: '',
    includeValidationIssues: true,
    format: 'excel', // 'excel' or 'pdf'
  });
  
  const [reportData, setReportData] = useState(null);
  const [reportUrl, setReportUrl] = useState(null);
  
  // Mutation for generating reports
  const reportMutation = useMutation({
    mutationFn: (reportFilters) => reportsAPI.generateReport(reportFilters),
    onSuccess: (response) => {
      toast.success('Relatório gerado com sucesso!');
      setReportData(response.data.summary);
      setReportUrl(response.data.reportUrl);
    },
    onError: (error) => {
      toast.error(`Erro ao gerar relatório: ${error.response?.data?.message || 'Tente novamente mais tarde.'}`);
      console.error('Error generating report:', error);
    },
  });
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle report generation
  const handleGenerateReport = () => {
    // Validate date range if both dates are provided
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      toast.error('A data inicial não pode ser posterior à data final.');
      return;
    }
    
    reportMutation.mutate(filters);
  };
  
  // Handle report download
  const handleDownloadReport = () => {
    if (!reportUrl) return;
    
    const url = `${process.env.REACT_APP_API_URL}${reportUrl}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_${new Date().toISOString().split('T')[0]}.${filters.format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      empregador: '',
      logo: '',
      operador: '',
      digitado: '',
      includeValidationIssues: true,
      format: 'excel',
    });
    setReportData(null);
    setReportUrl(null);
  };
  
  // Format numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };
  
  // Format percentage for display
  const formatPercentage = (value, total) => {
    if (!total) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Relatórios
      </Typography>
      
      <Grid container spacing={3}>
        {/* Filters Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Filtros
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Limpar Filtros
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Inicial"
                    value={filters.startDate}
                    onChange={(date) => handleFilterChange('startDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    slotProps={{
                      textField: { fullWidth: true, margin: 'normal' }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Final"
                    value={filters.endDate}
                    onChange={(date) => handleFilterChange('endDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    slotProps={{
                      textField: { fullWidth: true, margin: 'normal' }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Empregador</InputLabel>
                  <Select
                    value={filters.empregador}
                    onChange={(e) => handleFilterChange('empregador', e.target.value)}
                    label="Empregador"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="EMPRESA A">EMPRESA A</MenuItem>
                    <MenuItem value="EMPRESA B">EMPRESA B</MenuItem>
                    <MenuItem value="EMPRESA C">EMPRESA C</MenuItem>
                    <MenuItem value="EMPRESA D">EMPRESA D</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Logo</InputLabel>
                  <Select
                    value={filters.logo}
                    onChange={(e) => handleFilterChange('logo', e.target.value)}
                    label="Logo"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="1">Logo 1</MenuItem>
                    <MenuItem value="2">Logo 2</MenuItem>
                    <MenuItem value="3">Logo 3</MenuItem>
                    <MenuItem value="4">Logo 4</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Operador</InputLabel>
                  <Select
                    value={filters.operador}
                    onChange={(e) => handleFilterChange('operador', e.target.value)}
                    label="Operador"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="1">João Silva</MenuItem>
                    <MenuItem value="2">Maria Santos</MenuItem>
                    <MenuItem value="3">Pedro Oliveira</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status Digitado</InputLabel>
                  <Select
                    value={filters.digitado}
                    onChange={(e) => handleFilterChange('digitado', e.target.value)}
                    label="Status Digitado"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="true">Digitado</MenuItem>
                    <MenuItem value="false">Não Digitado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Formato</InputLabel>
                  <Select
                    value={filters.format}
                    onChange={(e) => handleFilterChange('format', e.target.value)}
                    label="Formato"
                  >
                    <MenuItem value="excel">
                      <ExcelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Excel (.xlsx)
                    </MenuItem>
                    <MenuItem value="pdf">
                      <PdfIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      PDF (.pdf)
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.includeValidationIssues}
                        onChange={(e) => handleFilterChange('includeValidationIssues', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Incluir Validações
                        <Tooltip title="Inclui informações sobre problemas de validação no relatório">
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleGenerateReport}
                disabled={reportMutation.isLoading}
                startIcon={reportMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : <FilterListIcon />}
                sx={{ minWidth: 200 }}
              >
                {reportMutation.isLoading ? 'Gerando...' : 'Gerar Relatório'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Report Results Section */}
        {reportData && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Resultados do Relatório
                </Typography>
                
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleDownloadReport}
                  disabled={!reportUrl}
                >
                  Baixar Relatório
                </Button>
              </Box>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Filtros Aplicados</AlertTitle>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {filters.startDate && (
                    <Chip 
                      label={`Data Inicial: ${filters.startDate.toLocaleDateString('pt-BR')}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  {filters.endDate && (
                    <Chip 
                      label={`Data Final: ${filters.endDate.toLocaleDateString('pt-BR')}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  {filters.empregador && (
                    <Chip 
                      label={`Empregador: ${filters.empregador}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  {filters.logo && (
                    <Chip 
                      label={`Logo: ${filters.logo}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  {filters.operador && (
                    <Chip 
                      label={`Operador: ${filters.operador}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  {filters.digitado && (
                    <Chip 
                      label={`Digitado: ${filters.digitado === 'true' ? 'Sim' : 'Não'}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              </Alert>
              
              <Grid container spacing={3}>
                {/* Summary Card */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resumo Geral
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total de Propostas
                          </Typography>
                          <Typography variant="h4">
                            {formatNumber(reportData.totalProposals)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Digitadas
                          </Typography>
                          <Typography variant="h4">
                            {formatNumber(reportData.digitizedProposals)}
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              ({formatPercentage(reportData.digitizedProposals, reportData.totalProposals)})
                            </Typography>
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Não Digitadas
                          </Typography>
                          <Typography variant="h4">
                            {formatNumber(reportData.nonDigitizedProposals)}
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              ({formatPercentage(reportData.nonDigitizedProposals, reportData.totalProposals)})
                            </Typography>
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Problemas de Validação
                          </Typography>
                          <Typography variant="h4">
                            {formatNumber(reportData.validationIssues)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Employer Breakdown */}
                {reportData.employerBreakdown && reportData.employerBreakdown.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Distribuição por Empregador
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                          <Grid container spacing={1}>
                            {reportData.employerBreakdown.map((item, index) => (
                              <Grid item xs={12} key={index}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                  <Typography variant="body2">
                                    {item.empregador || 'Não especificado'}
                                    {item.logo && ` (Logo ${item.logo})`}
                                  </Typography>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {formatNumber(item.count)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatPercentage(item.count, reportData.totalProposals)}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Divider />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {/* Operator Breakdown */}
                {reportData.operatorBreakdown && reportData.operatorBreakdown.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Distribuição por Operador
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                          <Grid container spacing={1}>
                            {reportData.operatorBreakdown.map((item, index) => (
                              <Grid item xs={12} key={index}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                  <Typography variant="body2">
                                    {item.nome || 'Não especificado'}
                                  </Typography>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {formatNumber(item.count)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatPercentage(item.count, reportData.totalProposals)}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Divider />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {/* Validation Issues */}
                {filters.includeValidationIssues && reportData.validationBreakdown && reportData.validationBreakdown.length > 0 && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Problemas de Validação
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                          <Grid container spacing={1}>
                            {reportData.validationBreakdown.map((item, index) => (
                              <Grid item xs={12} key={index}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                  <Typography variant="body2">
                                    {item.tipo || 'Não especificado'}
                                  </Typography>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {formatNumber(item.count)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatPercentage(item.count, reportData.validationIssues)}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Divider />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Reports;