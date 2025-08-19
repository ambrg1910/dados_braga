import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on initial load or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Set token in axios headers
        api.defaults.headers.common['x-auth-token'] = token;
        
        // Get current user data
        const res = await api.get('/api/auth/me');
        
        if (res.data.success) {
          setUser(res.data.data);
          setIsAuthenticated(true);
        } else {
          // Invalid token
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          delete api.defaults.headers.common['x-auth-token'];
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        delete api.defaults.headers.common['x-auth-token'];
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login user
  const login = async (usuario, senha) => {
    try {
      setIsLoading(true);
      const res = await api.post('/api/auth/login', { usuario, senha });
      
      if (res.data.success) {
        const { token, user } = res.data.data;
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Set token in axios headers
        api.defaults.headers.common['x-auth-token'] = token;
        
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success(`Bem-vindo, ${user.nome}!`);
        return true;
      } else {
        toast.error(res.data.error.message || 'Falha na autenticação');
        return false;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Erro ao fazer login';
      toast.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      delete api.defaults.headers.common['x-auth-token'];
      toast.info('Você saiu do sistema');
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      if (res.data.success) {
        toast.success('Senha alterada com sucesso');
        return true;
      } else {
        toast.error(res.data.error.message || 'Falha ao alterar senha');
        return false;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Erro ao alterar senha';
      toast.error(errorMsg);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};