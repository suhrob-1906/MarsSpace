import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/me/');
            setUser(response.data);
        } catch (error) {
            console.error("Auth check failed", error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login/', { username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            await checkAuth();
        } catch (error) {
            // Re-throw with user-friendly message
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                error.userMessage = 'Не удалось подключиться к серверу. Убедитесь, что backend запущен.';
            } else if (error.response?.status === 401) {
                error.userMessage = 'Неверное имя пользователя или пароль';
            }
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('/me/');
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to refresh user", error);
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
