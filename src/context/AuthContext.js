import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create context with undefined default value
const AuthContext = createContext(undefined);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
          // Clear any stale data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setLoading(false);
          return;
        }

        // First set the user from localStorage to maintain state during refresh
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          logout();
          return;
        }

        // Then validate token with backend without disrupting the session
        try {
          const response = await api.get('/auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
            // Add timeout to prevent long-hanging requests
            timeout: 5000
          });
          
          if (response.data.status !== 'success') {
            console.warn('Token validation unsuccessful');
          }
        } catch (error) {
          // Only logout on explicit 401 unauthorized
          if (error.response?.status === 401) {
            console.error('Token unauthorized:', error);
            logout();
          } else {
            // For other errors (network, timeout etc), keep the session
            console.warn('Token validation error:', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Log the full request URL for diagnostics
      const loginUrl = `${api.defaults.baseURL?.replace(/\/+$/,'')}/auth/login`;
      console.info('[auth] login URL ->', loginUrl);

      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.status === 'success') {
        const { token, data } = response.data;
        
        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        setUser(data.user);
        
        return { success: true, data };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      // Clear any partial data on error
      logout();
      // Provide detailed error info to aid diagnosis (network, timeout, CORS, etc.)
      console.error('[auth] login error:', {
        message: error.message,
        code: error.code,
        url: error.config?.url || null,
        method: error.config?.method || null,
        status: error.response?.status || null,
        responseData: error.response?.data || null,
        request: !!error.request
      });

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const patientSignup = async (data) => {
    try {
      // endpoint: POST /auth/patient/signup
      const signupUrl = `${api.defaults.baseURL?.replace(/\/+$/,'')}/auth/patient/signup`;
      console.info('[auth] signup URL ->', signupUrl);

      const response = await api.post('/auth/patient/signup', data);

      if (response.data.status === 'success') {
        const { token, data: respData } = response.data;

        // store token and user
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(respData.user));

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(respData.user);

        return { success: true, data: respData };
      }

      return { success: false, message: response.data.message || 'Signup failed' };
    } catch (error) {
      console.error('[auth] signup error:', {
        message: error.message,
        code: error.code,
        url: error.config?.url || null,
        method: error.config?.method || null,
        status: error.response?.status || null,
        responseData: error.response?.data || null,
        request: !!error.request
      });

      return { success: false, message: error.response?.data?.message || error.message || 'Signup failed' };
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear axios headers
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    login,
    patientSignup,
    logout,
    loading
  };

  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};