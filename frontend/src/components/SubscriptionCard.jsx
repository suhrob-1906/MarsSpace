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
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-2xl font-bold flex items-center">
                        💎 Премиум подписка
                    </h3>
                    <p className="mt-2 opacity-90">
                        Получи доступ к эксклюзивным курсам и материалам
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-center">
                            <span className="mr-2">✓</span>
                            Доступ ко всем курсам
                        </li>
                        <li className="flex items-center">
                            <span className="mr-2">✓</span>
                            Приоритетная поддержка
                        </li>
                        <li className="flex items-center">
                            <span className="mr-2">✓</span>
                            Эксклюзивные материалы
                        </li>
                        <li className="flex items-center">
                            <span className="mr-2">✓</span>
                            Специальный бейдж
                        </li>
                    </ul>

                    {error && (
                        <div className="mt-4 bg-red-500/20 border border-red-300 rounded px-3 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePurchase}
                        disabled={loading || user.coins < 100}
                        className={`mt-6 px-6 py-3 rounded-lg font-bold text-lg transition-all ${loading || user.coins < 100
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-white text-indigo-600 hover:bg-gray-100 hover:scale-105'
                            }`}
                    >
                        {loading ? (
                            'Обработка...'
                        ) : (
                            <>
                                Купить за 100 💰
                                {user.coins < 100 && (
                                    <span className="block text-xs mt-1">
                                        (У вас {user.coins} коинов)
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                </div>

                <div className="text-6xl ml-4">💎</div>
            </div>
        </div>
    );
}
