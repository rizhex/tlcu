import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getCurrentUser(),
    role: authService.getUserRole()
  });

  const updateAuth = () => {
    setAuthState({
      isAuthenticated: authService.isAuthenticated(),
      user: authService.getCurrentUser(),
      role: authService.getUserRole()
    });
  };

  const login = async (username, password) => {
    const result = await authService.login(username, password);
    updateAuth();
    return result;
  };

  const logout = () => {
    authService.logout();
    updateAuth();
  };

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      updateAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};