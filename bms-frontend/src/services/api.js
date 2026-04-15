import axios from "axios";

// Environment variable or default backend URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for cookies if the backend sets JWT in cookies
  headers: {
    "Content-Type": "application/json"
  }
});

// Assuming backend returns standard API payload { success, message, data }
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (err) => {
    const originalRequest = err.config;
    
    // If the error is 401 and we haven't retried yet
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        
        // Return original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, it means we must logout
        // Dispatch event so AuthContext can clean up state
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(err);
  }
);

export default api;
