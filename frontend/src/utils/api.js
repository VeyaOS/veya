import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log requests in development only — never log request data (could contain credentials)
api.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.log('API Request:', config.method.toUpperCase(), config.url);
  }
  return config;
});

export default api;
