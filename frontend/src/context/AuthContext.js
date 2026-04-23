import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setStudentData(res.data.studentData);
      } catch (error) {
        console.error('Auth check failed:', error.response?.data?.message || error.message);
        // Only remove token on 401 (unauthorized), not on 500 (server error)
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      
      // Set user directly from login response — don't rely on checkAuth
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });

      // Then try to get full profile
      try {
        const meRes = await api.get('/auth/me');
        setUser(meRes.data.user);
        setStudentData(meRes.data.studentData);
      } catch (meError) {
        console.error('Could not fetch full profile:', meError.message);
        // User is still set from login response above, so navigation will work
      }

      return { success: true, role: res.data.role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);

      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });

      try {
        const meRes = await api.get('/auth/me');
        setUser(meRes.data.user);
        setStudentData(meRes.data.studentData);
      } catch (meError) {
        console.error('Could not fetch full profile:', meError.message);
      }

      return { success: true, role: res.data.role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setStudentData(null);
  };

  return (
    <AuthContext.Provider value={{ user, studentData, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};