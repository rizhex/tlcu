import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Asegúrate que la URL base no termine con /
const getBaseUrl = () => {
  const base = import.meta.env.VITE_API_URL;
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const api = axios.create({
  baseURL: getBaseUrl(),  // Usa la función que limpia la URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas
api.interceptors.response.use(
  (response) => {
    // Solo loguear en desarrollo para no saturar consola en producción
    if (import.meta.env.DEV) {
      console.log(`✅ [API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Error logging diferenciado por entorno
    if (import.meta.env.DEV) {
      // Log detallado en desarrollo
      console.error(`❌ [API Error] ${error.response?.status || 'No status'}`, {
        url: error.config?.url,
        data: error.response?.data,
        message: error.message
      });
    } else {
      // Log mínimo en producción
      console.error(`API Error: ${error.config?.url} - ${error.response?.status || 'Network error'}`);
    }
    
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Usar ruta completa para evitar problemas en producción
      window.location.href = '/login';
    }
    
    // Manejo específico para producción (opcional)
    if (import.meta.env.PROD && !error.response) {
      // Si no hay respuesta en producción, probablemente es error de red
      console.error('Error de conexión con el servidor');
    }
    
    return Promise.reject(error);
  }
);

export default api;