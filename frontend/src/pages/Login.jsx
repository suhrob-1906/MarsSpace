import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err) {
            console.error(err);
            // Show user-friendly error message
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError('Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://127.0.0.1:8000');
            } else if (err.response?.status === 401) {
                setError('Неверное имя пользователя или пароль');
            } else if (err.userMessage) {
                setError(err.userMessage);
            } else {
                setError('Ошибка входа. Проверьте подключение к серверу.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface p-8 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white shadow-glow">
                            <Zap size={32} />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome to Space</h2>
                    <p className="text-slate-400 text-center mb-8">Enter your credentials to continue</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-1.5 ml-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="student1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-1.5 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-primary/25 hover:to-primary active:scale-[0.98] transition-all duration-200 mt-2"
                        >
                            Sign In
                        </button>
                    </form>

                    <p className="text-slate-500 text-center mt-6 text-sm">
                        Don't have an account? Ask your administrator.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
