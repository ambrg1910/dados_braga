import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Avatar,
  Divider,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  // State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
  });
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data) => updateProfile(data),
    onSuccess: () => {
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar perfil: ${error.response?.data?.message || 'Tente novamente mais tarde.'}`);
      console.error('Error updating profile:', error);
    },
  });
  
  const changePasswordMutation = useMutation({
    mutationFn: (data) => changePassword(data),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error) => {
      toast.error(`Erro ao alterar senha: ${error.response?.data?.message || 'Tente novamente mais tarde.'}`);
      console.error('Error changing password:', error);
    },
  });
  
  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password data change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile update
  const handleUpdateProfile = () => {
    if (!profileData.nome.trim()) {
      toast.error('O nome é obrigatório.');
      return;
    }
    
    if (!profileData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      toast.error('Por favor, insira um email válido.');
      return;
    }
    
    updateProfileMutation.mutate(profileData);
  };
  
  // Handle password change
  const handleChangePassword = () => {
    if (!passwordData.currentPassword) {
      toast.error('A senha atual é obrigatória.');
      return;
    }
    
    if (!passwordData.newPassword) {
      toast.error('A nova senha é obrigatória.');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('A confirmação da senha não corresponde à nova senha.');
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.nome) return 'U';
    
    const nameParts = user.nome.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Meu Perfil
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mr: 2
                }}
              >
                {getUserInitials()}
              </Avatar>
              
              <Box>
                <Typography variant="h5">
                  {user?.nome || 'Usuário'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.admin ? 'Administrador' : 'Operador'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'Email não disponível'}
                </Typography>
              </Box>
              
              {!isEditing && (
                <IconButton 
                  color="primary" 
                  sx={{ ml: 'auto' }}
                  onClick={() => setIsEditing(true)}
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {isEditing ? (
              <Box component="form" noValidate>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nome"
                  name="nome"
                  value={profileData.nome}
                  onChange={handleProfileChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                />
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        nome: user?.nome || '',
                        email: user?.email || '',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={updateProfileMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleUpdateProfile}
                    disabled={updateProfileMutation.isLoading}
                  >
                    {updateProfileMutation.isLoading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nome
                      </Typography>
                      <Typography variant="body1">
                        {user?.nome || 'Não definido'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nome de Usuário
                      </Typography>
                      <Typography variant="body1">
                        {user?.username || 'Não definido'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {user?.email || 'Não definido'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tipo de Usuário
                      </Typography>
                      <Typography variant="body1">
                        {user?.admin ? 'Administrador' : 'Operador'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
        
        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LockIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h5">
                Alterar Senha
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Alert severity="info" sx={{ mb: 3 }}>
              A senha deve ter pelo menos 6 caracteres e incluir letras e números para maior segurança.
            </Alert>
            
            <Box component="form" noValidate>
              <TextField
                fullWidth
                margin="normal"
                label="Senha Atual"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Nova Senha"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Confirmar Nova Senha"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={changePasswordMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isLoading}
                >
                  {changePasswordMutation.isLoading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Account Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Atividade da Conta
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Último Login
                    </Typography>
                    <Typography variant="body1">
                      {new Date().toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total de Ações
                    </Typography>
                    <Typography variant="body1">
                      {user?.totalAcoes || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pontuação
                    </Typography>
                    <Typography variant="body1">
                      {user?.pontuacao || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status da Conta
                    </Typography>
                    <Typography variant="body1" color={user?.ativo ? 'success.main' : 'error.main'}>
                      {user?.ativo ? 'Ativo' : 'Inativo'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;