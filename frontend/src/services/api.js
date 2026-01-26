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
        // Handle network errors
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            const errorMessage = 'Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://127.0.0.1:8000';
            error.userMessage = errorMessage;
            console.error('Network Error:', errorMessage);
        }
        
        // Handle 401 Unauthorized - logout user
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        // Add user-friendly error messages
        if (error.response?.data) {
            error.userMessage = error.response.data.detail || 
                               error.response.data.error || 
                               error.response.data.message ||
                               'Произошла ошибка при выполнении запроса';
        } else if (!error.userMessage) {
            error.userMessage = 'Произошла неизвестная ошибка';
        }
        
        return Promise.reject(error);
    }
);

export default api;
