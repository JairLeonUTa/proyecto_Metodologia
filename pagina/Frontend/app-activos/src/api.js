import axios from 'axios';

const API_URL = import.meta.env.VITE_ACTIVOS_API || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor global para inyectar el token en el encabezado Authorization
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

export default api;