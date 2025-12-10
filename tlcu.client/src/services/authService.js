import api from './api';

// Función para decodificar JWT (sin verificar, solo para obtener datos)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password
    });
    
    // Guardar token
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      
      // Decodificar JWT para obtener información del usuario
      const decoded = decodeJWT(response.data.access_token);
      
      // Crear objeto usuario con datos del token
      const user = {
        username: decoded?.username || username,
        roles: decoded?.roles || ['Admin'], // Asumiendo que 'roles' viene en el token
        sub: decoded?.sub || null
      };
      
      // Determinar rol principal (convertir a minúscula para consistencia)
      const mainRole = user.roles?.[0]?.toLowerCase() || 'admin';
      
      localStorage.setItem('user', JSON.stringify({
        username: user.username,
        role: mainRole
      }));
    }
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error de autenticación');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || 'visitor'; // 'admin', 'editor', 'visitor'
};