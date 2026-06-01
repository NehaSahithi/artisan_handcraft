import axios from 'axios';

// Define dynamic base URL using environment variables for Vercel/Render deployment compatibility
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure Axios with credentials enabled to automatically carry httpOnly cookies
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Configure Response Interceptor to intercept session expirations (401 status)
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the server returns 401 (Unauthorized - e.g. token expired, deactivated)
    if (error.response && error.response.status === 401) {
      const wasAuthenticated = !!localStorage.getItem('karigar_user');
      
      // Clear local auth states
      localStorage.removeItem('karigar_user');
      localStorage.removeItem('karigar_auth_active');
      
      // Check if current page is part of the public auth/verification flow
      const isAuthPage = typeof window !== 'undefined' && 
        ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].some(
          (path) => window.location.pathname.startsWith(path)
        );

      if (wasAuthenticated && !isAuthPage && typeof window !== 'undefined') {
        console.warn('⚠️ Session expired or unauthorized. Redirecting to login...');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default API;