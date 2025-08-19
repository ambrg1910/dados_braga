import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  Alert,
  AlertTitle,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { uploadAPI } from '../services/api';

const Upload = () => {
  const queryClient = useQueryClient();
  
  // State for file upload
  const [file, setFile] = useState(null);
  const [spreadsheetType, setSpreadsheetType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationFile, setValidationFile] = useState(null);
  
  // Mutations for uploading and validating spreadsheets
  const uploadMutation = useMutation({
    mutationFn: (formData) => {
      return uploadAPI.uploadSpreadsheet(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
    },
    onSuccess: (response) => {
      toast.success('Planilha enviada com sucesso!');
      setFile(null);
      setUploadProgress(0);
      queryClient.invalidateQueries(['dashboardSummary']);
      queryClient.invalidateQueries(['proposalsSummary']);
    },
    onError: (error) => {
      toast.error(`Erro ao enviar planilha: ${error.response?.data?.message || 'Tente novamente mais tarde.'}`);
      setUploadProgress(0);
      console.error('Error uploading spreadsheet:', error);
    },
  });
  
  const validateMutation = useMutation({
    mutationFn: (formData) => {
      return uploadAPI.validateSpreadsheet(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
    },
    onSuccess: (response) => {
      toast.success('Planilha validada com sucesso!');
      setValidationFile(response.data);
      setFile(null);
      setUploadProgress(0);
      queryClient.invalidateQueries(['validationsSummary']);
    },
    onError: (error) => {
      toast.error(`Erro ao validar planilha: ${error.response?.data?.message || 'Tente novamente mais tarde.'}`);
      setUploadProgress(0);
      console.error('Error validating spreadsheet:', error);
    },
  });
  
  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  // Handle spreadsheet type selection
  const handleTypeChange = (event) => {
    setSpreadsheetType(event.target.value);
  };
  
  // Handle file upload
  const handleUpload = () => {
    if (!file || !spreadsheetType) {
      toast.error('Por favor, selecione um arquivo e o tipo de planilha.');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', spreadsheetType);
    
    uploadMutation.mutate(formData);
  };
  
  // Handle file validation
  const handleValidate = () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo para validar.');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    validateMutation.mutate(formData);
  };
  
  // Handle download of validation results
  const handleDownloadValidation = () => {
    if (!validationFile) return;
    
    const url = `${process.env.REACT_APP_API_URL}/uploads/${validationFile.filename}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', validationFile.originalname);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload de Planilhas
      </Typography>
      
      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Enviar Nova Planilha
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selecione um arquivo Excel (.xlsx) ou CSV para enviar.
              </Typography>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mt: 2, p: 1.5, border: '1px dashed' }}
              >
                {file ? file.name : 'Selecionar Arquivo'}
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Tipo de Planilha</InputLabel>
              <Select
                value={spreadsheetType}
                onChange={handleTypeChange}
                label="Tipo de Planilha"
              >
                <MenuItem value="PROD_PROM">Produção/Promoção</MenuItem>
                <MenuItem value="ESTEIRA">Esteira</MenuItem>
                <MenuItem value="OP_REALIZADAS">Operações Realizadas</MenuItem>
                <MenuItem value="SEGUROS">Seguros</MenuItem>
              </Select>
            </FormControl>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  {uploadProgress}%
                </Typography>
              </Box>
            )}
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleUpload}
              disabled={!file || !spreadsheetType || uploadMutation.isLoading}
              startIcon={uploadMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            >
              {uploadMutation.isLoading ? 'Enviando...' : 'Enviar Planilha'}
            </Button>
          </Paper>
        </Grid>
        
        {/* Validation Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Validar Planilha
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selecione um arquivo Excel (.xlsx) ou CSV para validar contra os registros existentes.
              </Typography>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mt: 2, p: 1.5, border: '1px dashed' }}
              >
                {file ? file.name : 'Selecionar Arquivo'}
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  {uploadProgress}%
                </Typography>
              </Box>
            )}
            
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleValidate}
              disabled={!file || validateMutation.isLoading}
              startIcon={validateMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            >
              {validateMutation.isLoading ? 'Validando...' : 'Validar Planilha'}
            </Button>
            
            {validationFile && (
              <Alert severity="success" sx={{ mt: 3 }}>
                <AlertTitle>Validação Concluída</AlertTitle>
                <Typography variant="body2" gutterBottom>
                  Arquivo de resultados disponível para download.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  color="success"
                  startIcon={<DescriptionIcon />}
                  onClick={handleDownloadValidation}
                  sx={{ mt: 1 }}
                >
                  Baixar Resultados
                </Button>
              </Alert>
            )}
          </Paper>
        </Grid>
        
        {/* Instructions Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Instruções de Upload
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tipos de Planilha
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Produção/Promoção" 
                        secondary="Planilhas de produção e promoção de cartões" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Esteira" 
                        secondary="Planilhas de acompanhamento da esteira de propostas" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Operações Realizadas" 
                        secondary="Planilhas de operações já realizadas" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Seguros" 
                        secondary="Planilhas de seguros associados aos cartões" 
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Formatos Aceitos
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Excel (.xlsx, .xls)" 
                        secondary="Planilhas do Microsoft Excel" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="CSV (.csv)" 
                        secondary="Arquivos de valores separados por vírgula" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Outros formatos não são aceitos" 
                        secondary="Por favor, converta para Excel ou CSV antes de enviar" 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Upload;