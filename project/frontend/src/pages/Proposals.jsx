import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBR from 'date-fns/locale/pt-BR';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { proposalsAPI } from '../services/api';

const Proposals = () => {
  // State for pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    empregador: '',
    logo: '',
    digitado: '',
    dataInicio: null,
    dataFim: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('data_proposta');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentProposal, setCurrentProposal] = useState(null);
  const [editForm, setEditForm] = useState({
    situacao: '',
    extrator: '',
    utilizacao: '',
  });
  
  // Fetch proposals data
  const {
    data: proposalsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['proposals', page, rowsPerPage, searchTerm, filters, sortBy, sortOrder],
    queryFn: () => proposalsAPI.getProposals({
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm,
      empregador: filters.empregador,
      logo: filters.logo,
      digitado: filters.digitado,
      dataInicio: filters.dataInicio ? filters.dataInicio.toISOString().split('T')[0] : null,
      dataFim: filters.dataFim ? filters.dataFim.toISOString().split('T')[0] : null,
      sortBy,
      sortOrder,
    }).then(res => res.data),
    keepPreviousData: true,
  });
  
  // Fetch summary data for filters
  const { data: summaryData } = useQuery({
    queryKey: ['proposalsSummary'],
    queryFn: () => proposalsAPI.getProposalsSummary().then(res => res.data.data),
  });
  
  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search and filter changes
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };
  
  const handleDateChange = (field) => (date) => {
    setFilters(prev => ({ ...prev, [field]: date }));
    setPage(0);
  };
  
  const clearFilters = () => {
    setFilters({
      empregador: '',
      logo: '',
      digitado: '',
      dataInicio: null,
      dataFim: null,
    });
    setPage(0);
  };
  
  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(0);
  };
  
  // Handle edit dialog
  const openEditDialog = (proposal) => {
    setCurrentProposal(proposal);
    setEditForm({
      situacao: proposal.situacao || '',
      extrator: proposal.extrator || '',
      utilizacao: proposal.utilizacao || '',
    });
    setEditDialogOpen(true);
  };
  
  const handleEditFormChange = (field) => (event) => {
    setEditForm(prev => ({ ...prev, [field]: event.target.value }));
  };
  
  const handleSaveEdit = async () => {
    try {
      await proposalsAPI.updateProposal(currentProposal.id, editForm);
      toast.success('Proposta atualizada com sucesso!');
      setEditDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Erro ao atualizar proposta. Por favor, tente novamente.');
      console.error('Error updating proposal:', error);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Alert severity="error">
        Erro ao carregar propostas. Por favor, tente novamente mais tarde.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Propostas
      </Typography>
      
      {/* Summary Cards */}
      {summaryData && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total de Propostas
                </Typography>
                <Typography variant="h4">
                  {summaryData.totalCount.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Digitadas
                </Typography>
                <Typography variant="h4">
                  {(summaryData.digitadoStats.find(item => item.digitado === 'DIGITADO')?.count || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.light' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Não Digitadas
                </Typography>
                <Typography variant="h4">
                  {(summaryData.digitadoStats.find(item => item.digitado === 'NÃO DIGITADO')?.count || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Validações Pendentes
                </Typography>
                <Typography variant="h4">
                  {summaryData.validationStats.find(item => item.resolvido === false)?.count || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por CPF, Matrícula, Nome ou Proposta"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 1 }}
            >
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
            {showFilters && (
              <Button variant="outlined" color="secondary" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
          </Grid>
          
          {showFilters && (
            <>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Empregador</InputLabel>
                  <Select
                    value={filters.empregador}
                    onChange={handleFilterChange('empregador')}
                    label="Empregador"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {summaryData?.empregadorStats.map((item) => (
                      <MenuItem key={item.empregador} value={item.empregador}>
                        {item.empregador}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Logo</InputLabel>
                  <Select
                    value={filters.logo}
                    onChange={handleFilterChange('logo')}
                    label="Logo"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {summaryData?.logoStats.map((item) => (
                      <MenuItem key={item.logo} value={item.logo}>
                        {item.logo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.digitado}
                    onChange={handleFilterChange('digitado')}
                    label="Status"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="DIGITADO">Digitado</MenuItem>
                    <MenuItem value="NÃO DIGITADO">Não Digitado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Início"
                    value={filters.dataInicio}
                    onChange={handleDateChange('dataInicio')}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    slotProps={{
                      textField: { fullWidth: true, variant: 'outlined' },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Fim"
                    value={filters.dataFim}
                    onChange={handleDateChange('dataFim')}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    slotProps={{
                      textField: { fullWidth: true, variant: 'outlined' },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      
      {/* Proposals Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('id_unico')} sx={{ cursor: 'pointer' }}>
                ID Único {sortBy === 'id_unico' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('nome')} sx={{ cursor: 'pointer' }}>
                Nome {sortBy === 'nome' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('cpf')} sx={{ cursor: 'pointer' }}>
                CPF {sortBy === 'cpf' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('matricula')} sx={{ cursor: 'pointer' }}>
                Matrícula {sortBy === 'matricula' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('empregador')} sx={{ cursor: 'pointer' }}>
                Empregador {sortBy === 'empregador' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('logo')} sx={{ cursor: 'pointer' }}>
                Logo {sortBy === 'logo' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('proposta30')} sx={{ cursor: 'pointer' }}>
                Proposta {sortBy === 'proposta30' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('digitado')} sx={{ cursor: 'pointer' }}>
                Status {sortBy === 'digitado' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('data_proposta')} sx={{ cursor: 'pointer' }}>
                Data {sortBy === 'data_proposta' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proposalsData?.data.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell>{proposal.id_unico}</TableCell>
                <TableCell>{proposal.nome}</TableCell>
                <TableCell>{proposal.cpf}</TableCell>
                <TableCell>{proposal.matricula}</TableCell>
                <TableCell>{proposal.empregador}</TableCell>
                <TableCell>{proposal.logo}</TableCell>
                <TableCell>{proposal.proposta30}</TableCell>
                <TableCell>
                  <Chip
                    label={proposal.digitado}
                    color={proposal.digitado === 'DIGITADO' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {proposal.data_proposta ? new Date(proposal.data_proposta).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => openEditDialog(proposal)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {proposalsData?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Nenhuma proposta encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={proposalsData?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Editar Proposta
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={currentProposal?.cpf || ''}
                  disabled
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Matrícula"
                  value={currentProposal?.matricula || ''}
                  disabled
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={currentProposal?.nome || ''}
                  disabled
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Empregador"
                  value={currentProposal?.empregador || ''}
                  disabled
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Logo"
                  value={currentProposal?.logo || ''}
                  disabled
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Proposta"
                  value={currentProposal?.proposta30 || ''}
                  disabled
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Status"
                  value={currentProposal?.digitado || ''}
                  disabled
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Situação"
                  value={editForm.situacao}
                  onChange={handleEditFormChange('situacao')}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Extrator"
                  value={editForm.extrator}
                  onChange={handleEditFormChange('extrator')}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Utilização"
                  value={editForm.utilizacao}
                  onChange={handleEditFormChange('utilizacao')}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Proposals;