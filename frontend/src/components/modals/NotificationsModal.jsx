import { useTranslation } from 'react-i18next';
import { X, Bell } from 'lucide-react';

const NotificationsModal = ({ onClose }) => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-surface rounded-xl p-6 w-full max-w-md border border-slate-700" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold">{t('notifications.title')}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">{t('notifications.no_new')}</p>
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;
