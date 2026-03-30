import { createContext, useContext, useState, useEffect } from 'react';
import { getUserFromToken, isTokenExpired } from '@/service/auth';

const AuthContext = createContext(null);

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      let token = sessionStorage.getItem('access_token');
      let userData = sessionStorage.getItem('user_data');
      
      if (!token && localStorage.getItem('remember_me') === 'true') {
        token = localStorage.getItem('access_token');
        userData = localStorage.getItem('user_data');
        if (token && userData) {
          sessionStorage.setItem('access_token', token);
          sessionStorage.setItem('user_data', userData);
        }
      }
      
      if (token && userData && !isTokenExpired()) {
        setUser(JSON.parse(userData));
      } else {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_data');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (authData) => {
    sessionStorage.setItem('access_token', authData.token);
    
    const userData = {
      userId: authData.userId,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role
    };
    
    sessionStorage.setItem('user_data', JSON.stringify(userData));
    
    // Nếu check Remember Me từ login form
    if (localStorage.getItem('remember_me') === 'true') {
      localStorage.setItem('access_token', authData.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
    
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('remember_me');
    setUser(null);
  };

  const updateAuthUser = (newData) => {
    if (!user) return;
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    sessionStorage.setItem('user_data', JSON.stringify(updatedUser));
    if (localStorage.getItem('remember_me') === 'true') {
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
    updateAuthUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
