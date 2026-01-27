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
            <header className="bg-surface border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                MarsSpace
                            </span>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center gap-6">
                            {/* User Stats */}
                            <div className="flex items-center gap-4">
                                {/* Activity Days */}
                                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400">{t('dashboard.activity_days')}</span>
                                        <span className="text-sm font-bold">{user?.activity_days || 0}</span>
                                    </div>
                                </div>

                                {/* Coins */}
                                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                                    <CoinsIcon className="w-5 h-5 text-amber-500" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400">{t('dashboard.coins')}</span>
                                        <span className="text-sm font-bold">{user?.coins || 0}</span>
                                    </div>
                                </div>

                                {/* Energy */}
                                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
                                    <Zap className="w-5 h-5 text-blue-500" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400">{t('dashboard.energy')}</span>
                                        <span className="text-sm font-bold">{user?.wallet?.energy || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Language Switcher */}
                            <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
                                <button
                                    onClick={() => changeLanguage('ru')}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${i18n.language === 'ru'
                                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    RU
                                </button>
                                <button
                                    onClick={() => changeLanguage('uz')}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${i18n.language === 'uz'
                                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    UZ
                                </button>
                            </div>

                            {/* Subscribe Button */}
                            {!user?.has_premium && (
                                <button
                                    onClick={() => setShowSubscription(true)}
                                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
                                >
                                    {t('subscription.subscribe')}
                                </button>
                            )}

                            {/* Notifications */}
                            <button
                                onClick={() => setShowNotifications(true)}
                                className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {/* Notification badge - можно добавить позже */}
                                {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
                            </button>

                            {/* User Avatar */}
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                                )}
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
