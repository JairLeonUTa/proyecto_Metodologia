import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:5001/api';

// Instancia para los servicios de Activos (Puerto 5002)
const api = axios.create({
  baseURL: API_URL,
});

// Instancia exclusiva para el Login / Autenticación (Puerto 5001)
export const authApi = axios.create({
  baseURL: AUTH_URL,
});

// Interceptor de PETICIÓN: Inyecta el token en las peticiones salientes de activos
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de RESPUESTA (Fase 4): Captura el error 401 y expulsa al usuario
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      alert('Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión nuevamente.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;