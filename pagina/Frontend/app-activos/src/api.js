import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de PETICIÓN: Inyecta el token en las peticiones salientes
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
    // Verificamos si el error es 401 Unauthorized
    if (error.response && error.response.status === 401) {
      alert('Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión nuevamente.');
      localStorage.removeItem('token'); // Limpiamos la sesión
      window.location.href = '/login';  // Expulsamos al usuario a la pantalla de login
    }
    return Promise.reject(error);
  }
);

export default api;