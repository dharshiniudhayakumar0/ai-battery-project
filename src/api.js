import axios from 'axios';

const api = axios.create({
  // Use VITE_API_URL from environment variables (Vercel/Render)
  // Fallback to localhost for local development
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`,
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
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle authentication errors (e.g. 401/422)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 422)) {
      console.warn("Authentication failed or token expired. Clearing session.");
      localStorage.removeItem('token');
      localStorage.removeItem('loginUser');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
