import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('isep_token');

    if (!token) {
      setLoading(false);
      return;
    }

    const restoreUser = async () => {
      try {
        const response = await api.get('/auth/me');

        setUser(response.data.user || response.data);
      } catch (error) {
        console.error('Failed to restore authentication:', error);
        localStorage.removeItem('isep_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const data = response.data;

    if (data.token) {
      localStorage.setItem('isep_token', data.token);
    }

    if (data.user) {
      setUser(data.user);
    } else if (data.admin) {
      setUser(data.admin);
    }

    return data;
  };

  const register = async (registrationData) => {
    const response = await api.post('/auth/register', registrationData);

    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      localStorage.removeItem('isep_token');
      localStorage.removeItem('isep_admin_token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}