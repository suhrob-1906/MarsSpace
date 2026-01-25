import axios from 'axios';

// Use environment variable or default to localhost
// For Vercel/Render, VITE_API_BASE_URL should be set
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Basic token refresh logic could go here, for MVP just logout if 401
        // if (error.response?.status === 401 && !originalRequest._retry) { ... }
        return Promise.reject(error);
    }
);

export default api;
