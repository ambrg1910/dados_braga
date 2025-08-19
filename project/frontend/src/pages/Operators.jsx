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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Key as KeyIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { operatorsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Operators = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({
    nome: '',
    usuario: '',
    senha: '',
    email: '',
    admin: false,
  });
  
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    admin: false,
    ativo: true,
  });
  
  const [resetPasswordForm, setResetPasswordForm] = useState({
    senha: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  
  // Fetch operators data
  const {
    data: operatorsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['operators', page, rowsPerPage, searchTerm],
    queryFn: () => operatorsAPI.getOperators({
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm,
    }).then(res => res.data),
    keepPreviousData: true,
  });
  
  // Fetch operator performance data
  const { data: performanceData } = useQuery({
    queryKey: ['operatorPerformance'],
    queryFn: () => operatorsAPI.getOperatorPerformance().then(res => res.data.data),
  });
  
  // Mutations
  const createOperatorMutation = useMutation({
    mutationFn: (data) => operatorsAPI.createOperator(data),
    onSuccess: () => {
      toast.success('Operador criado com sucesso!');
      setCreateDialogOpen(false);
      setCreateForm({
        nome: '',
        usuario: '',
        senha: '',
        email: '',
        admin: false,
      });
      queryClient.invalidateQueries(['operators']);
    },
    onError: (error) => {
      toast.error(`Erro ao criar operador: ${error.response?.data?.message || 'Tente novamente mais tarde.'}`);
      console.error('Error creating operator:', error);
    },
  });
  
  const updateOperatorMutation = useMutation({
    mutationFn: ({ id, data }) => operatorsAPI.updateOperator(id, data),
    onSuccess: () => {
      toast.success('Operador atualizado com sucesso!');
      setEditDialogOpen(false);
      queryClient.invalidateQueries(['operators']);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar operador: ${error.response?.data?.message || 'Tente novamente mais tarde.'}`);
      console.error('Error updating operator:', error);
    },
  });
  
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, data }) => operatorsAPI.resetPassword(id, data),
    onSuccess: () => {
      toast.success('Senha redefinida com sucesso!');
      setResetPasswordDialogOpen(false);
      setResetPasswordForm({ senha: '' });
    },
    onError: (error) => {
      toast.error(`Erro ao redefinir senha: ${error.response?.data?.message || 'Tente novamente mais tarde.'}`);
      console.error('Error resetting password:', error);
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
  
  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Handle form changes
  const handleCreateFormChange = (field) => (event) => {
    const value = field === 'admin' ? event.target.checked : event.target.value;
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleEditFormChange = (field) => (event) => {
    const value = field === 'admin' || field === 'ativo' ? event.target.checked : event.target.value;
    setEditForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleResetPasswordFormChange = (event) => {
    setResetPasswordForm({ senha: event.target.value });
  };
  
  // Handle dialog actions
  const openEditDialog = (operator) => {
    setCurrentOperator(operator);
    setEditForm({
      nome: operator.nome || '',
      email: operator.email || '',
      admin: operator.admin || false,
      ativo: operator.ativo !== false, // default to true if not specified
    });
    setEditDialogOpen(true);
  };
  
  const openResetPasswordDialog = (operator) => {
    setCurrentOperator(operator);
    setResetPasswordForm({ senha: '' });
    setResetPasswordDialogOpen(true);
  };
  
  const handleCreateOperator = () => {
    createOperatorMutation.mutate(createForm);
  };
  
  const handleUpdateOperator = () => {
    if (currentOperator) {
      updateOperatorMutation.mutate({
        id: currentOperator.id,
        data: editForm,
      });
    }
  };
  
  const handleResetPassword = () => {
    if (currentOperator) {
      resetPasswordMutation.mutate({
        id: currentOperator.id,
        data: resetPasswordForm,
      });
    }
  };
  
  // Get performance data for an operator
  const getOperatorPerformance = (operatorId) => {
    if (!performanceData) return null;
    return performanceData.operatorStats.find(op => op.id === operatorId);
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
        Erro ao carregar operadores. Por favor, tente novamente mais tarde.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Operadores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Novo Operador
        </Button>
      </Box>
      
      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por nome ou usuário"
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
        </Grid>
      </Paper>
      
      {/* Operators Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Usuário</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Desempenho</TableCell>
              <TableCell>Última Ação</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {operatorsData?.data.map((operator) => {
              const performance = getOperatorPerformance(operator.id);
              return (
                <TableRow key={operator.id}>
                  <TableCell>{operator.nome}</TableCell>
                  <TableCell>{operator.usuario}</TableCell>
                  <TableCell>{operator.email || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={operator.admin ? 'Admin' : 'Operador'}
                      color={operator.admin ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={operator.ativo !== false ? 'Ativo' : 'Inativo'}
                      color={operator.ativo !== false ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {performance ? (
                      <Tooltip title={`Score: ${performance.score}%`}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 1 }}>
                            <CircularProgress
                              variant="determinate"
                              value={performance.score}
                              color={performance.score > 80 ? 'success' : performance.score > 50 ? 'warning' : 'error'}
                              size={24}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" component="div" color="text.secondary">
                                {performance.score}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2">
                            {performance.total_actions} ações
                          </Typography>
                        </Box>
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {operator.ultima_acao 
                      ? new Date(operator.ultima_acao).toLocaleString('pt-BR') 
                      : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEditDialog(operator)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Redefinir Senha">
                      <IconButton size="small" onClick={() => openResetPasswordDialog(operator)}>
                        <KeyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {operatorsData?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhum operador encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={operatorsData?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
      
      {/* Create Operator Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Novo Operador
          <IconButton
            aria-label="close"
            onClick={() => setCreateDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={createForm.nome}
                  onChange={handleCreateFormChange('nome')}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Usuário"
                  value={createForm.usuario}
                  onChange={handleCreateFormChange('usuario')}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={createForm.email}
                  onChange={handleCreateFormChange('email')}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  value={createForm.senha}
                  onChange={handleCreateFormChange('senha')}
                  variant="outlined"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={createForm.admin}
                      onChange={handleCreateFormChange('admin')}
                      color="primary"
                    />
                  }
                  label="Administrador"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateOperator} 
            color="primary" 
            variant="contained"
            disabled={createOperatorMutation.isLoading || !createForm.nome || !createForm.usuario || !createForm.senha}
          >
            {createOperatorMutation.isLoading ? 'Criando...' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Operator Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Editar Operador
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={editForm.nome}
                  onChange={handleEditFormChange('nome')}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Usuário"
                  value={currentOperator?.usuario || ''}
                  disabled
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditFormChange('email')}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.admin}
                      onChange={handleEditFormChange('admin')}
                      color="primary"
                    />
                  }
                  label="Administrador"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.ativo}
                      onChange={handleEditFormChange('ativo')}
                      color="primary"
                    />
                  }
                  label="Ativo"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateOperator} 
            color="primary" 
            variant="contained"
            disabled={updateOperatorMutation.isLoading || !editForm.nome}
          >
            {updateOperatorMutation.isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Redefinir Senha
          <IconButton
            aria-label="close"
            onClick={() => setResetPasswordDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Redefinir senha para: <strong>{currentOperator?.nome}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Nova Senha"
              type={showPassword ? 'text' : 'password'}
              value={resetPasswordForm.senha}
              onChange={handleResetPasswordFormChange}
              variant="outlined"
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleResetPassword} 
            color="primary" 
            variant="contained"
            disabled={resetPasswordMutation.isLoading || !resetPasswordForm.senha}
          >
            {resetPasswordMutation.isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Operators;