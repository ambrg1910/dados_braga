import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper 
        elevation={3} 
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" color="primary" sx={{ fontSize: '8rem', fontWeight: 'bold' }}>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Página Não Encontrada
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500 }}>
          A página que você está procurando não existe ou foi movida.
          Por favor, verifique o endereço ou retorne à página inicial.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            Voltar para o Início
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;