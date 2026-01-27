import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Header() {
    const { user, logout, setUser } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    if (!user) return null;

    const handleLanguageChange = async (lang) => {
        try {
            await api.patch('/api/v1/me/', { language: lang });
            setUser(prev => ({ ...prev, language: lang }));
        } catch (error) {
            console.error('Failed to update language:', error);
        }
    };

    const handleAdminDashboard = () => {
        setShowDropdown(false);
        navigate('/admin-panel');
    };

    return (
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo and Brand */}
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <span className="text-2xl">🚀</span>
                        </div>
                        <span className="text-xl font-bold hidden sm:inline">MarsSpace</span>
                    </Link>

                    {/* Stats Display */}
                    <div className="flex items-center space-x-4 sm:space-x-6">
                        {/* Activity Days */}
                        <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-full">
                            <span className="text-lg">🔥</span>
                            <div className="hidden sm:block">
                                <p className="text-xs opacity-80">Активность</p>
                                <p className="text-sm font-bold">{user.activity_days || 0} дней</p>
                            </div>
                            <p className="text-sm font-bold sm:hidden">{user.activity_days || 0}</p>
                        </div>

                        {/* Coins */}
                        <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-full">
                            <span className="text-lg">💰</span>
                            <div className="hidden sm:block">
                                <p className="text-xs opacity-80">Коины</p>
                                <p className="text-sm font-bold">{user.coins || 0}</p>
                            </div>
                            <p className="text-sm font-bold sm:hidden">{user.coins || 0}</p>
                        </div>

                        {/* Points */}
                        <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-full">
                            <span className="text-lg">⭐</span>
                            <div className="hidden sm:block">
                                <p className="text-xs opacity-80">Очки</p>
                                <p className="text-sm font-bold">{user.points || 0}</p>
                            </div>
                            <p className="text-sm font-bold sm:hidden">{user.points || 0}</p>
                        </div>

                        {/* User Avatar & Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-white border-2 border-white shadow-lg">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span>{user.first_name?.[0] || user.username?.[0] || '?'}</span>
                                    )}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 text-gray-800">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-semibold">
                                            {user.first_name} {user.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">@{user.username}</p>
                                        {user.has_premium && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full">
                                                💎 Премиум
                                            </span>
                                        )}
                                    </div>

                                    {/* Admin Dashboard Link */}
                                    {user.role === 'ADMIN' && (
                                        <div className="border-b border-gray-200">
                                            <button
                                                onClick={handleAdminDashboard}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 text-indigo-600 font-semibold"
                                            >
                                                👨‍💼 Админ панель
                                            </button>
                                        </div>
                                    )}

                                    {/* Language Switcher */}
                                    <div className="px-4 py-2">
                                        <p className="text-xs text-gray-500 mb-1">Язык / Til</p>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleLanguageChange('ru')}
                                                className={`px-3 py-1 text-sm rounded transition-colors ${user.language === 'ru'
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-200 hover:bg-gray-300'
                                                    }`}
                                            >
                                                🇷🇺 RU
                                            </button>
                                            <button
                                                onClick={() => handleLanguageChange('uz')}
                                                className={`px-3 py-1 text-sm rounded transition-colors ${user.language === 'uz'
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-200 hover:bg-gray-300'
                                                    }`}
                                            >
                                                🇺🇿 UZ
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 mt-2">
                                        <button
                                            onClick={() => {
                                                logout();
                                                setShowDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            🚪 Выйти
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
