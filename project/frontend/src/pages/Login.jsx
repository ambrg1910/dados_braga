import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    usuario: '',
    senha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (error) setError('');
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.usuario.trim() || !formData.senha) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const success = await login(formData.usuario, formData.senha);
      
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="usuario"
        label="Usuário"
        name="usuario"
        autoComplete="username"
        autoFocus
        value={formData.usuario}
        onChange={handleChange}
        disabled={isSubmitting}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="senha"
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        id="senha"
        autoComplete="current-password"
        value={formData.senha}
        onChange={handleChange}
        disabled={isSubmitting}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Entrar'
        )}
      </Button>
    </Box>
  );
};

export default Login;