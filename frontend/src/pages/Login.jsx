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
            const userData = await login(username, password);

            // Redirect based on role
            if (userData?.role === 'TEACHER') {
                navigate('/teacher', { replace: true });
            } else if (userData?.role === 'ADMIN') {
                navigate('/admin-panel', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error(err);
            // Show user-friendly error message
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError('Не удалось подключиться к серверу. Убедитесь, что backend запущен.');
            } else if (err.response?.status === 401) {
                setError('Неверное имя пользователя или пароль');
            } else if (err.response?.status === 400) {
                setError('Ошибка запроса на сервер. Возможно, проблема с конфигурацией backend.');
            } else if (err.userMessage) {
                setError(err.userMessage);
            } else {
                setError('Ошибка входа. Проверьте подключение к серверу.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-red-300/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-orange-100 shadow-2xl shadow-orange-500/10 relative z-10">

                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                        <Zap size={32} />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Welcome Back!</h2>
                <p className="text-slate-500 text-center mb-8">Enter your credentials to access MarsSpace</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1.5 ml-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                            placeholder="e.g. martian_explorer"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1.5 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-4"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-slate-400 text-center mt-8 text-sm">
                    Don't have an account?
                    <a
                        href="https://t.me/sssuuuhhhaaarrriiik"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-orange-500 font-semibold hover:underline transition-colors"
                    >
                        Contact Admin
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
