import { useState } from 'react';
import api from '../services/api';

export default function SubscriptionCard({ user, onPurchaseSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePurchase = async () => {
        if (user.coins < 100) {
            setError('Недостаточно коинов! Нужно 100 коинов.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/v1/subscription/purchase/');
            onPurchaseSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при покупке подписки');
        } finally {
            setLoading(false);
        }
    };

    // If user already has premium
    if (user.has_premium) {
        return (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center">
                            💎 Премиум подписка
                        </h3>
                        <p className="mt-2 opacity-90">
                            У вас активная премиум подписка!
                        </p>
                        {user.premium_expires_at && (
                            <p className="text-sm mt-1 opacity-75">
                                Действует до: {new Date(user.premium_expires_at).toLocaleDateString('ru-RU')}
                            </p>
                        )}
                    </div>
                    <div className="text-6xl">✓</div>
                </div>
            </div>
        );
    }

    // Purchase card
    return (
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <h3 className="text-2xl font-black flex items-center text-slate-800">
                        <span className="bg-orange-100 p-2 rounded-lg mr-3 text-2xl">👑</span>
                        Premium Access
                    </h3>
                    <p className="mt-2 text-slate-600">
                        Unlock the full potential of your education journey!
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-slate-600">
                        <li className="flex items-center">
                            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 text-xs">✓</span>
                            Access to all Eduverse video lessons
                        </li>
                        <li className="flex items-center">
                            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 text-xs">✓</span>
                            Create posts in Community
                        </li>
                        <li className="flex items-center">
                            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 text-xs">✓</span>
                            Valid for 30 days
                        </li>
                    </ul>

                    {error && (
                        <div className="mt-4 bg-red-50 text-red-500 border border-red-100 rounded-lg px-3 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePurchase}
                        disabled={loading || user.coins < 100}
                        className={`mt-6 w-full py-3 rounded-xl font-bold text-lg transition-all shadow-lg ${loading || user.coins < 100
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-orange-500/40 hover:-translate-y-1'
                            }`}
                    >
                        {loading ? (
                            'Processing...'
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>Get Premium</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">100 🟡</span>
                            </div>
                        )}
                    </button>
                    {user.coins < 100 && (
                        <p className="text-center text-xs text-slate-400 mt-2">
                            You have {user.coins} coins
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
