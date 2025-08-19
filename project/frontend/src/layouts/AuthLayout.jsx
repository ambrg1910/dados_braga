import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const AuthBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.background.default 
    : theme.palette.primary.light,
  backgroundImage: theme.palette.mode === 'dark'
    ? 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url("/auth-bg-dark.svg")'
    : 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("/auth-bg-light.svg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  maxWidth: 450,
  width: '100%',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.5)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const AuthLayout = () => {
  return (
    <AuthBackground>
      <Container maxWidth="sm">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Card Operations Insights & Validation System
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Sistema de Validação e Insights para Operações de Cartão
          </Typography>
        </Box>
        
        <AuthCard elevation={6}>
          <Outlet />
        </AuthCard>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Card Operations Insights & Validation System
          </Typography>
        </Box>
      </Container>
    </AuthBackground>
  );
};

export default AuthLayout;