import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Medal, Star, Zap } from 'lucide-react';
import api from '../../services/api';

const Leaderboard = () => {
    const { t } = useTranslation();
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentUserRank, setCurrentUserRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await api.get('/leaderboard/');
            setLeaderboard(response.data.leaderboard);
            setCurrentUserRank(response.data.current_user_rank);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg">1</div>;
            case 2:
                return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold shadow-lg">2</div>;
            case 3:
                return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold shadow-lg">3</div>;
            default:
                return <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">{rank}</div>;
        }
    };

    const getRankBadge = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-5 h-5 text-yellow-400" />;
            case 2:
                return <Medal className="w-5 h-5 text-gray-400" />;
            case 3:
                return <Medal className="w-5 h-5 text-amber-600" />;
            default:
                return null;
        }
    };

    if (loading) return <div className="text-center p-4 text-slate-400">{t('common.loading')}</div>;

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-white">{t('season.leaderboard')}</h3>
            </div>

            <div className="divide-y divide-slate-800">
                {leaderboard.length > 0 ? (
                    leaderboard.map((entry) => (
                        <div
                            key={entry.user_id}
                            className={`flex items-center p-4 hover:bg-slate-800/30 transition-colors ${entry.rank === currentUserRank ? 'bg-primary/10 border-l-4 border-primary' : ''
                                } ${entry.rank <= 3 ? 'bg-gradient-to-r from-slate-800/50 to-transparent' : ''
                                }`}
                        >
                            <div className="mr-4 flex-shrink-0 flex items-center gap-2">
                                {getRankIcon(entry.rank)}
                                {getRankBadge(entry.rank)}
                            </div>

                            <div className="flex-1 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 ring-2 ring-slate-600">
                                    {entry.avatar_url ? (
                                        <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                                            {entry.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className={`font-semibold ${entry.rank <= 3 ? 'text-white' : 'text-slate-200'}`}>
                                        {entry.username}
                                    </div>
                                    <div className="text-xs text-slate-500">{entry.attempts_count} games • {entry.best_wpm} WPM</div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={`text-lg font-bold ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-gray-400' : entry.rank === 3 ? 'text-amber-600' : 'text-primary'}`}>
                                    {entry.total_score}
                                </div>
                                {entry.potential_reward > 0 && (
                                    <div className="text-xs font-semibold text-green-400 flex items-center gap-1 justify-end">
                                        <Zap size={12} className="fill-green-400" />
                                        +{entry.potential_reward}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        No players yet this season. Be the first!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
