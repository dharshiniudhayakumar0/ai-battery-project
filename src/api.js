import axios from 'axios';

const api = axios.create({
  // Base at the root and use explicit /api/ in all calls for clarity and consistency
  baseURL: `http://${window.location.hostname}:5000`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
