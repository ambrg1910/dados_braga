import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for baseURL/path normalization and auth token
api.interceptors.request.use(
  (config) => {
    // Avoid double "/api" when baseURL already contains it
    if (
      typeof config.baseURL === 'string' &&
      config.baseURL.endsWith('/api') &&
      typeof config.url === 'string' &&
      config.url.startsWith('/api/')
    ) {
      config.url = config.url.replace(/^\/api\//, '/');
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
const authAPI = {
  login: (usuario, senha) => api.post('/api/auth/login', { usuario, senha }),
  logout: () => api.post('/api/auth/logout'),
  getCurrentUser: () => api.get('/api/auth/me'),
  changePassword: (currentPassword, newPassword) => 
    api.post('/api/auth/change-password', { currentPassword, newPassword })
};

// Proposals API
const proposalsAPI = {
  getAll: (params) => api.get('/api/proposals', { params }),
  getById: (id) => api.get(`/api/proposals/${id}`),
  getByUniqueId: (id_unico) => api.get(`/api/proposals/unique/${id_unico}`),
  update: (id, data) => api.put(`/api/proposals/${id}`, data),
  getStats: () => api.get('/api/proposals/stats')
};

// Validations API
const validationsAPI = {
  getAll: (params) => api.get('/api/validations', { params }),
  getById: (id) => api.get(`/api/validations/${id}`),
  resolve: (id, data) => api.put(`/api/validations/${id}/resolve`, data),
  getStats: () => api.get('/api/validations/stats')
};

// Operators API
const operatorsAPI = {
  getAll: () => api.get('/api/operators'),
  getById: (id) => api.get(`/api/operators/${id}`),
  create: (data) => api.post('/api/operators', data),
  update: (id, data) => api.put(`/api/operators/${id}`, data),
  resetPassword: (id, data) => api.put(`/api/operators/${id}/reset-password`, data),
  getPerformance: (id) => api.get(`/api/operators/${id}/performance`)
};

// Dashboard API
const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/summary'),
  getDailyStats: () => api.get('/api/dashboard/daily-stats'),
  getOperatorPerformance: () => api.get('/api/dashboard/operator-performance'),
  getValidationBreakdown: () => api.get('/api/dashboard/validation-breakdown'),
  getReport: (params) => api.get('/api/dashboard/report', { params })
};

// Upload API
const uploadAPI = {
  uploadSpreadsheet: (formData) => api.post('/api/upload/spreadsheet', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  validateSpreadsheet: (formData) => api.post('/api/upload/validate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

export {
  authAPI,
  proposalsAPI,
  validationsAPI,
  operatorsAPI,
  dashboardAPI,
  uploadAPI
};

export default api;