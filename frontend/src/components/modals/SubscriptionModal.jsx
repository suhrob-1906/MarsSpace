import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Crown, Check, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const SubscriptionModal = ({ onClose }) => {
    const { t } = useTranslation();
    const { user, refreshUser } = useAuth();
    const [purchasing, setPurchasing] = useState(false);

    const SUBSCRIPTION_COST = 100;

    const benefits = [
        'Доступ ко всем курсам',
        'Приоритетная поддержка',
        'Эксклюзивные задания',
        'Бонусные коины каждый день',
        'Уникальный значок Premium',
        'Доступ к закрытым видео Eduverse',
        'Возможность создавать посты'
    ];

    const handlePurchase = async () => {
        if (user?.coins < SUBSCRIPTION_COST) {
            toast.error(`Недостаточно коинов! У вас ${user?.coins || 0}, нужно ${SUBSCRIPTION_COST}`);
            return;
        }

        setPurchasing(true);
        try {
            const response = await api.post('/subscription/purchase/');
            toast.success('Подписка успешно активирована! 🎉');
            await refreshUser(); // Refresh user data
            onClose();
        } catch (error) {
            console.error('Purchase failed:', error);
            toast.error(error.response?.data?.error || 'Ошибка при покупке подписки');
        } finally {
            setPurchasing(false);
        }
    };

    const hasEnoughCoins = user?.coins >= SUBSCRIPTION_COST;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg border border-orange-100 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Crown className="w-6 h-6 text-amber-500" />
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                            Premium Подписка
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Premium Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
                    <div className="text-center mb-6">
                        <div className="inline-block p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4 shadow-lg">
                            <Crown className="w-12 h-12 text-white" />
                        </div>
                        <h4 className="text-3xl font-bold text-slate-800 mb-2">Premium</h4>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Coins className="w-8 h-8 text-yellow-500" />
                            <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                {SUBSCRIPTION_COST}
                            </p>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">коинов / 30 дней</p>

                        {/* User Coins */}
                        <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200">
                            <span className="text-sm text-slate-600">Ваши коины:</span>
                            <span className={`text-lg font-bold ${hasEnoughCoins ? 'text-green-600' : 'text-red-600'}`}>
                                {user?.coins || 0}
                            </span>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3 mb-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm text-slate-700">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Subscribe Button */}
                    <button
                        onClick={handlePurchase}
                        disabled={purchasing || !hasEnoughCoins}
                        className={`w-full py-3 rounded-lg font-bold text-lg transition-all transform ${hasEnoughCoins && !purchasing
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:scale-105 shadow-lg shadow-orange-500/30'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {purchasing ? 'Обработка...' : hasEnoughCoins ? 'Купить Premium' : 'Недостаточно коинов'}
                    </button>
                </div>

                {!hasEnoughCoins && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-700 text-center">
                            ⚠️ Вам нужно еще <strong>{SUBSCRIPTION_COST - (user?.coins || 0)}</strong> коинов для покупки Premium
                        </p>
                    </div>
                )}

                <p className="text-center text-xs text-slate-500">
                    Подписка действует 30 дней с момента покупки
                </p>
            </div>
        </div>
    );
};

export default SubscriptionModal;
