import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Medal, Star } from 'lucide-react';
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
                return <Trophy className="w-5 h-5 text-yellow-400" />;
            case 2:
                return <Medal className="w-5 h-5 text-gray-300" />;
            case 3:
                return <Medal className="w-5 h-5 text-amber-600" />;
            default:
                return <span className="text-slate-500 font-bold w-5 text-center">{rank}</span>;
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
                            className={`flex items-center p-3 hover:bg-slate-800/30 transition-colors ${entry.rank === currentUserRank ? 'bg-primary/10 border-l-2 border-primary' : ''
                                }`}
                        >
                            <div className="mr-4 flex-shrink-0 w-8 flex justify-center">
                                {getRankIcon(entry.rank)}
                            </div>

                            <div className="flex-1 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                                    {entry.avatar_url ? (
                                        <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                                            {entry.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-200">{entry.username}</div>
                                    <div className="text-xs text-slate-500">{entry.attempts_count} games</div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-bold text-primary">{entry.total_score}</div>
                                <div className="text-xs text-green-400">+{entry.potential_reward || 0} coins</div>
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
