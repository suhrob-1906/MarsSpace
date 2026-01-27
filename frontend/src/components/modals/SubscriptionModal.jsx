import { useTranslation } from 'react-i18next';
import { X, Crown, Check } from 'lucide-react';

const SubscriptionModal = ({ onClose }) => {
    const { t } = useTranslation();

    const benefits = [
        'Доступ ко всем курсам',
        'Приоритетная поддержка',
        'Эксклюзивные задания',
        'Бонусные коины каждый день',
        'Уникальный значок Premium',
        'Доступ к закрытым видео'
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-surface rounded-xl p-6 w-full max-w-lg border border-slate-700" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Crown className="w-6 h-6 text-amber-500" />
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                            {t('subscription.title')}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Premium Card */}
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
                    <div className="text-center mb-6">
                        <div className="inline-block p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4">
                            <Crown className="w-12 h-12 text-white" />
                        </div>
                        <h4 className="text-3xl font-bold mb-2">Premium</h4>
                        <p className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                            50,000 UZS
                        </p>
                        <p className="text-sm text-slate-400 mt-1">в месяц</p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3 mb-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Subscribe Button */}
                    <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105">
                        {t('subscription.subscribe')}
                    </button>
                </div>

                <p className="text-center text-sm text-slate-400">
                    Подписка продлевается автоматически. Отменить можно в любой момент.
                </p>
            </div>
        </div>
    );
};

export default SubscriptionModal;
