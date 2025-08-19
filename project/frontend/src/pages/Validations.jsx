import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { validationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Validations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipoValidacao: '',
    resolvido: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('data_criacao');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for resolution dialog
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [currentValidation, setCurrentValidation] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Fetch validations data
  const {
    data: validationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['validations', page, rowsPerPage, searchTerm, filters, sortBy, sortOrder],
    queryFn: () => validationsAPI.getValidations({
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm,
      tipoValidacao: filters.tipoValidacao,
      resolvido: filters.resolvido,
      sortBy,
      sortOrder,
    }).then(res => res.data),
    keepPreviousData: true,
  });
  
  // Fetch summary data for filters
  const { data: summaryData } = useQuery({
    queryKey: ['validationsSummary'],
    queryFn: () => validationsAPI.getValidationsSummary().then(res => res.data.data),
  });
  
  // Mutation for resolving validation issues
  const resolveValidationMutation = useMutation({
    mutationFn: (id) => validationsAPI.resolveValidation(id),
    onSuccess: () => {
      toast.success('Validação resolvida com sucesso!');
      setResolutionDialogOpen(false);
      queryClient.invalidateQueries(['validations']);
      queryClient.invalidateQueries(['validationsSummary']);
    },
    onError: (error) => {
      toast.error('Erro ao resolver validação. Por favor, tente novamente.');
      console.error('Error resolving validation:', error);
    },
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
  
  const clearFilters = () => {
    setFilters({
      tipoValidacao: '',
      resolvido: '',
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
  
  // Handle resolution dialog
  const openResolutionDialog = (validation) => {
    setCurrentValidation(validation);
    setResolutionDialogOpen(true);
  };
  
  const handleResolveValidation = () => {
    if (currentValidation) {
      resolveValidationMutation.mutate(currentValidation.id);
    }
  };
  
  // Handle details dialog
  const openDetailsDialog = (validation) => {
    setCurrentValidation(validation);
    setDetailsDialogOpen(true);
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
        Erro ao carregar validações. Por favor, tente novamente mais tarde.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Validações
      </Typography>
      
      {/* Summary Cards */}
      {summaryData && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total de Validações
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
                  Resolvidas
                </Typography>
                <Typography variant="h4">
                  {(summaryData.resolvidoStats.find(item => item.resolvido === true)?.count || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.light' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Pendentes
                </Typography>
                <Typography variant="h4">
                  {(summaryData.resolvidoStats.find(item => item.resolvido === false)?.count || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Tipo Mais Comum
                </Typography>
                <Typography variant="h6" noWrap>
                  {summaryData.tipoValidacaoStats[0]?.tipo_validacao || '-'}
                </Typography>
                <Typography variant="h4">
                  {summaryData.tipoValidacaoStats[0]?.count || 0}
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
              placeholder="Buscar por CPF, Matrícula ou Descrição"
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
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Tipo de Validação</InputLabel>
                  <Select
                    value={filters.tipoValidacao}
                    onChange={handleFilterChange('tipoValidacao')}
                    label="Tipo de Validação"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {summaryData?.tipoValidacaoStats.map((item) => (
                      <MenuItem key={item.tipo_validacao} value={item.tipo_validacao}>
                        {item.tipo_validacao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.resolvido}
                    onChange={handleFilterChange('resolvido')}
                    label="Status"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="true">Resolvido</MenuItem>
                    <MenuItem value="false">Pendente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      
      {/* Validations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('id_unico')} sx={{ cursor: 'pointer' }}>
                ID Único {sortBy === 'id_unico' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('tipo_validacao')} sx={{ cursor: 'pointer' }}>
                Tipo {sortBy === 'tipo_validacao' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('descricao')} sx={{ cursor: 'pointer' }}>
                Descrição {sortBy === 'descricao' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('resolvido')} sx={{ cursor: 'pointer' }}>
                Status {sortBy === 'resolvido' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('data_criacao')} sx={{ cursor: 'pointer' }}>
                Data Criação {sortBy === 'data_criacao' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => handleSort('data_resolucao')} sx={{ cursor: 'pointer' }}>
                Data Resolução {sortBy === 'data_resolucao' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {validationsData?.data.map((validation) => (
              <TableRow key={validation.id}>
                <TableCell>{validation.id_unico}</TableCell>
                <TableCell>{validation.tipo_validacao}</TableCell>
                <TableCell>
                  {validation.descricao.length > 50
                    ? `${validation.descricao.substring(0, 50)}...`
                    : validation.descricao}
                </TableCell>
                <TableCell>
                  <Chip
                    label={validation.resolvido ? 'Resolvido' : 'Pendente'}
                    color={validation.resolvido ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {validation.data_criacao ? new Date(validation.data_criacao).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell>
                  {validation.data_resolucao ? new Date(validation.data_resolucao).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell>
                  <Tooltip title="Detalhes">
                    <IconButton size="small" onClick={() => openDetailsDialog(validation)}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {!validation.resolvido && (
                    <Tooltip title="Marcar como Resolvido">
                      <IconButton size="small" onClick={() => openResolutionDialog(validation)}>
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {validationsData?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma validação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={validationsData?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
      
      {/* Resolution Dialog */}
      <Dialog open={resolutionDialogOpen} onClose={() => setResolutionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Resolver Validação
          <IconButton
            aria-label="close"
            onClick={() => setResolutionDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Tem certeza que deseja marcar esta validação como resolvida?
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Tipo: {currentValidation?.tipo_validacao}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ID Único: {currentValidation?.id_unico}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Descrição: {currentValidation?.descricao}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolutionDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleResolveValidation} 
            color="primary" 
            variant="contained"
            disabled={resolveValidationMutation.isLoading}
          >
            {resolveValidationMutation.isLoading ? 'Processando...' : 'Resolver'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalhes da Validação
          <IconButton
            aria-label="close"
            onClick={() => setDetailsDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">ID Único</Typography>
                <Typography variant="body1" gutterBottom>{currentValidation?.id_unico || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Tipo de Validação</Typography>
                <Typography variant="body1" gutterBottom>{currentValidation?.tipo_validacao || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Descrição</Typography>
                <Typography variant="body1" gutterBottom>{currentValidation?.descricao || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={currentValidation?.resolvido ? 'Resolvido' : 'Pendente'}
                  color={currentValidation?.resolvido ? 'success' : 'error'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Data de Criação</Typography>
                <Typography variant="body1" gutterBottom>
                  {currentValidation?.data_criacao 
                    ? new Date(currentValidation.data_criacao).toLocaleString('pt-BR') 
                    : '-'}
                </Typography>
              </Grid>
              {currentValidation?.resolvido && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Data de Resolução</Typography>
                    <Typography variant="body1" gutterBottom>
                      {currentValidation?.data_resolucao 
                        ? new Date(currentValidation.data_resolucao).toLocaleString('pt-BR') 
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Resolvido Por</Typography>
                    <Typography variant="body1" gutterBottom>{currentValidation?.resolvido_por_nome || '-'}</Typography>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2">Dados Adicionais</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {currentValidation?.dados_adicionais 
                      ? JSON.stringify(JSON.parse(currentValidation.dados_adicionais), null, 2) 
                      : 'Nenhum dado adicional'}
                  </pre>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)} color="primary">
            Fechar
          </Button>
          {!currentValidation?.resolvido && (
            <Button 
              onClick={() => {
                setDetailsDialogOpen(false);
                openResolutionDialog(currentValidation);
              }} 
              color="primary" 
              variant="contained"
            >
              Resolver
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Validations;