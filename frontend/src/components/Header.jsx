import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Bell, Zap, Flame, Coins as CoinsIcon, Globe } from 'lucide-react';
import NotificationsModal from './modals/NotificationsModal';
import SubscriptionModal from './modals/SubscriptionModal';

const Header = () => {
    const { t, i18n } = useTranslation();
    const { user, refreshUser } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSubscription, setShowSubscription] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    return (
        <>
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/20">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-800">
                                MarsSpace
                            </span>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center gap-6">
                            {/* User Stats */}
                            <div className="flex items-center gap-4">
                                {/* Activity Days */}
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500">{t('dashboard.activity_days')}</span>
                                        <span className="text-sm font-bold text-slate-800">{user?.activity_days || 0}</span>
                                    </div>
                                </div>

                                {/* Coins */}
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                                    <CoinsIcon className="w-5 h-5 text-yellow-500" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500">{t('dashboard.coins')}</span>
                                        <span className="text-sm font-bold text-slate-800">{user?.coins || 0}</span>
                                    </div>
                                </div>

                                {/* Energy */}
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                                    <Zap className="w-5 h-5 text-blue-500" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500">{t('dashboard.energy')}</span>
                                        <span className="text-sm font-bold text-slate-800">{user?.wallet?.energy || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Language Switcher */}
                            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                                <button
                                    onClick={() => changeLanguage('ru')}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${i18n.language === 'ru'
                                        ? 'bg-white text-orange-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    RU
                                </button>
                                <button
                                    onClick={() => changeLanguage('uz')}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${i18n.language === 'uz'
                                        ? 'bg-white text-orange-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    UZ
                                </button>
                            </div>

                            {/* Subscribe Button */}
                            {!user?.has_premium && (
                                <button
                                    onClick={() => setShowSubscription(true)}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md shadow-orange-500/20"
                                >
                                    {t('subscription.subscribe')}
                                </button>
                            )}

                            {/* Notifications */}
                            <button
                                onClick={() => setShowNotifications(true)}
                                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                            >
                                <Bell className="w-5 h-5" />
                            </button>

                            {/* User Avatar */}
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold text-slate-800 leading-none">
                                        {user?.first_name} {user?.last_name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">{user?.username}</div>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-bold text-white">{user?.username?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Modals */}
            {showNotifications && (
                <NotificationsModal onClose={() => setShowNotifications(false)} />
            )}
            {showSubscription && (
                <SubscriptionModal onClose={() => setShowSubscription(false)} />
            )}
        </>
    );
};

export default Header;
