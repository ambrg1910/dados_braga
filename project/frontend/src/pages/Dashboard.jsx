import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

import { dashboardAPI } from '../services/api';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const Dashboard = () => {
  const theme = useTheme();
  
  // Fetch dashboard summary data
  const { data: summaryData, isLoading: isSummaryLoading, error: summaryError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardAPI.getSummary().then(res => res.data.data),
  });
  
  // Fetch daily stats data
  const { data: dailyStatsData, isLoading: isDailyStatsLoading, error: dailyStatsError } = useQuery({
    queryKey: ['dashboardDailyStats'],
    queryFn: () => dashboardAPI.getDailyStats().then(res => res.data.data),
  });
  
  // Fetch operator performance data
  const { data: operatorData, isLoading: isOperatorLoading, error: operatorError } = useQuery({
    queryKey: ['operatorPerformance'],
    queryFn: () => dashboardAPI.getOperatorPerformance().then(res => res.data.data),
  });
  
  // Fetch validation breakdown data
  const { data: validationData, isLoading: isValidationLoading, error: validationError } = useQuery({
    queryKey: ['validationBreakdown'],
    queryFn: () => dashboardAPI.getValidationBreakdown().then(res => res.data.data),
  });
  
  // Prepare data for pie chart
  const digitadoChartData = {
    labels: ['Digitado', 'Não Digitado'],
    datasets: [
      {
        data: summaryData ? [
          summaryData.digitadoStats.find(item => item.digitado === 'DIGITADO')?.count || 0,
          summaryData.digitadoStats.find(item => item.digitado === 'NÃO DIGITADO')?.count || 0,
        ] : [0, 0],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.error.main,
        ],
        borderColor: [
          theme.palette.success.dark,
          theme.palette.error.dark,
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for line chart
  const dailyProposalsChartData = {
    labels: dailyStatsData?.dailyProposals.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('pt-BR');
    }) || [],
    datasets: [
      {
        label: 'Total',
        data: dailyStatsData?.dailyProposals.map(item => item.total) || [],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        tension: 0.1,
      },
      {
        label: 'Digitado',
        data: dailyStatsData?.dailyProposals.map(item => item.digitado) || [],
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.main,
        tension: 0.1,
      },
      {
        label: 'Não Digitado',
        data: dailyStatsData?.dailyProposals.map(item => item.nao_digitado) || [],
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.main,
        tension: 0.1,
      },
    ],
  };
  
  // Prepare data for validation issues bar chart
  const validationChartData = {
    labels: validationData?.validationTypes.map(item => item.tipo_validacao) || [],
    datasets: [
      {
        label: 'Não Resolvido',
        data: validationData?.validationTypes.map(item => item.nao_resolvido) || [],
        backgroundColor: theme.palette.error.main,
      },
      {
        label: 'Resolvido',
        data: validationData?.validationTypes.map(item => item.resolvido) || [],
        backgroundColor: theme.palette.success.main,
      },
    ],
  };
  
  // Loading state
  if (isSummaryLoading || isDailyStatsLoading || isOperatorLoading || isValidationLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Error state
  if (summaryError || dailyStatsError || operatorError || validationError) {
    return (
      <Alert severity="error">
        Erro ao carregar dados do dashboard. Por favor, tente novamente mais tarde.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total de Propostas
              </Typography>
              <Typography variant="h3">
                {summaryData?.totalProposals.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Propostas Digitadas
              </Typography>
              <Typography variant="h3">
                {(summaryData?.digitadoStats.find(item => item.digitado === 'DIGITADO')?.count || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'error.light' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Propostas Não Digitadas
              </Typography>
              <Typography variant="h3">
                {(summaryData?.digitadoStats.find(item => item.digitado === 'NÃO DIGITADO')?.count || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Problemas de Validação
              </Typography>
              <Typography variant="h3">
                {summaryData?.validationIssues.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Status das Propostas
            </Typography>
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie data={digitadoChartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Propostas por Dia (Últimos 30 dias)
            </Typography>
            <Box sx={{ height: 250 }}>
              <Line 
                data={dailyProposalsChartData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Validation Issues and Recent Uploads */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Problemas de Validação por Tipo
              </Typography>
              <Button 
                component={Link} 
                to="/validations" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
              >
                Ver Todos
              </Button>
            </Box>
            <Box sx={{ height: 300 }}>
              <Bar 
                data={validationChartData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      stacked: true
                    },
                    x: {
                      stacked: true
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Uploads Recentes
              </Typography>
              <Button 
                component={Link} 
                to="/upload" 
                size="small" 
                endIcon={<CloudUploadIcon />}
              >
                Upload
              </Button>
            </Box>
            <List>
              {summaryData?.recentUploads.map((upload, index) => (
                <div key={upload.id}>
                  <ListItem>
                    <ListItemIcon>
                      <CloudUploadIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={upload.descricao}
                      secondary={
                        <>
                          {upload.operador_nome} - {new Date(upload.data_hora).toLocaleString('pt-BR')}
                        </>
                      }
                    />
                  </ListItem>
                  {index < summaryData.recentUploads.length - 1 && <Divider />}
                </div>
              ))}
              {summaryData?.recentUploads.length === 0 && (
                <ListItem>
                  <ListItemText primary="Nenhum upload recente" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Operator Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Desempenho dos Operadores
              </Typography>
              <Button 
                component={Link} 
                to="/operators" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
              >
                Ver Todos
              </Button>
            </Box>
            <Grid container spacing={2}>
              {operatorData?.operatorStats.slice(0, 4).map((operator) => (
                <Grid item xs={12} sm={6} md={3} key={operator.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {operator.nome}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                          <CircularProgress
                            variant="determinate"
                            value={operator.score}
                            color={operator.score > 80 ? 'success' : operator.score > 50 ? 'warning' : 'error'}
                            size={60}
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
                              {operator.score}%
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Validadas: {operator.propostas_validadas}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Erros: {operator.propostas_com_erro}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Ações: {operator.total_actions}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;