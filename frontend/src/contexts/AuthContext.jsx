import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth status with token from localStorage:', token); // Debug log

      if (!token) {
        console.log('No token found in localStorage');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Auth status response:', response.data); // Debug log
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth status check error:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    try {
      console.log('Login attempt with token:', token); // Debug log
      
      if (!token) {
        throw new Error('No token provided to login function');
      }

      // Store the Firebase token first
      console.log('Storing Firebase token in localStorage:', token); // Debug log
      localStorage.setItem('token', token);
      
      // Verify token was stored
      const storedToken = localStorage.getItem('token');
      console.log('Verified stored token:', storedToken); // Debug log
      
      if (!storedToken) {
        throw new Error('Failed to store token in localStorage');
      }

      // Then verify with backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Login response:', response.data); // Debug log
      
      // Update user state
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      // Clear token if login fails
      localStorage.removeItem('token');
      toast.error('Login failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const completeProfile = async (profileData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Profile completion error:', error);
      toast.error('Failed to complete profile. Please try again.');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    completeProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;