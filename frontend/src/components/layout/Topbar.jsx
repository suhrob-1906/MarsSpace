import { Bell, Flame, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 border-b border-slate-700/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between ml-64">
            <div className="text-slate-400 text-sm">
                Welcome back, <span className="text-white font-medium">{user?.first_name || user?.username}</span>!
            </div>

            <div className="flex items-center gap-6">
                {/* Stats pills */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-full border border-slate-700/50">
                        <Flame size={16} className="text-orange-500 fill-orange-500" />
                        <span className="text-sm font-bold text-white">{user?.activity_days || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-full border border-slate-700/50">
                        <Coins size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-white">{user?.coins || 0}</span>
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-700/50" />

                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all">
                    Subscribe
                </button>

                <div className="relative">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
                    </button>
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600">
                    {user?.first_name?.[0] || user?.username?.[0]}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
