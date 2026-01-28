import { useEffect, useState } from 'react';
import { Play, Trophy, Zap, Target, BookOpen, Clock } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import CountdownTimer from '../components/CountdownTimer';
import Header from '../components/Header';
import SubscriptionCard from '../components/SubscriptionCard';
import AIChatWidget from '../components/AIChatWidget';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user, setUser } = useAuth();
    const [recentProgress, setRecentProgress] = useState(null);
    const [season, setSeason] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch progress
                const progressRes = await api.get('/my-progress/');
                if (progressRes.data.length > 0) {
                    setRecentProgress(progressRes.data[0]);
                }

                // Fetch season data for countdown
                const leaderboardRes = await api.get('/leaderboard/');
                if (leaderboardRes.data.season) {
                    setSeason(leaderboardRes.data.season);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };
        fetchData();
    }, []);

    const handlePurchaseSuccess = (data) => {
        setUser(prev => ({
            ...prev,
            coins: data.coins_remaining,
            has_premium: true,
            premium_expires_at: data.premium_expires_at
        }));
    };

    const getProgressPercent = (prog) => {
        if (!prog) return 0;
        return Math.round((prog.completed_lessons_count / 12) * 100);
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                            {t('dashboard.welcome')}, {user?.username}!
                        </h1>
                        <p className="text-slate-400 text-lg">Track your progress and achievements on Mars 🚀</p>
                    </div>

                    {/* Season Countdown */}
                    {season && (
                        <div className="bg-gradient-to-br from-red-900/30 to-slate-900 p-4 rounded-xl border border-red-500/30 backdrop-blur-sm">
                            <p className="text-sm text-slate-400 mb-2">
                                {t('season.title')}: <span className="text-red-400 font-bold">{season.title}</span>
                            </p>
                            <CountdownTimer
                                endDate={season.end_date}
                                timeRemaining={season.time_remaining}
                            />
                        </div>
                    )}
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 rounded-2xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all hover:scale-105">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Trophy className="text-blue-400" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{user?.points || 0}</div>
                                <div className="text-xs text-slate-400">Points</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-900/40 to-slate-900 rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-all hover:scale-105">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <Zap className="text-yellow-400" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{user?.coins || 0}</div>
                                <div className="text-xs text-slate-400">Coins</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/40 to-slate-900 rounded-2xl p-4 border border-green-500/20 hover:border-green-500/40 transition-all hover:scale-105">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Target className="text-green-400" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{user?.activity_days || 0}</div>
                                <div className="text-xs text-slate-400">Day Streak</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 rounded-2xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Clock className="text-purple-400" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{user?.last_wpm || 0}</div>
                                <div className="text-xs text-slate-400">WPM</div>
                            </div>
                        </div>
                    </div>
                </div>

                <SubscriptionCard user={user} onPurchaseSuccess={handlePurchaseSuccess} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Hero Card */}
                    <div className="md:col-span-2 bg-gradient-to-br from-red-900/50 via-orange-900/30 to-slate-900 rounded-3xl p-8 border border-red-500/30 relative overflow-hidden group hover:border-red-500/50 transition-all">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/20 transition-all" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10">
                            {recentProgress ? (
                                <>
                                    <div className="flex items-start justify-between mb-8">
                                        <div>
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 text-sm font-bold mb-4 border border-red-500/30">
                                                <BookOpen size={16} />
                                                {recentProgress.course_title?.toUpperCase() || 'COURSE'}
                                            </span>
                                            <h3 className="text-3xl font-black text-white mb-3">Lesson {recentProgress.current_lesson_index}</h3>
                                            <p className="text-slate-300 max-w-md text-lg">
                                                {t('courses.continue')}
                                            </p>
                                        </div>
                                        <div className="w-20 h-20 rounded-2xl border-4 border-red-500/40 bg-slate-900/50 flex items-center justify-center relative backdrop-blur-sm">
                                            <span className="text-2xl font-black text-white">{getProgressPercent(recentProgress)}%</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-6 bg-slate-900/50 rounded-full h-3 overflow-hidden border border-slate-700">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                                            style={{ width: `${getProgressPercent(recentProgress)}%` }}
                                        />
                                    </div>

                                    <Link to={`/courses/${recentProgress.course}`} className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-900/50 hover:scale-105">
                                        <Play size={20} className="fill-white" />
                                        {t('courses.continue')}
                                    </Link>
                                </>
                            ) : (
                                <div className="flex flex-col items-start">
                                    <h3 className="text-3xl font-black text-white mb-4">{t('dashboard.welcome')} MarsSpace! 🚀</h3>
                                    <p className="text-slate-300 mb-8 text-lg">Start your coding journey on Mars today!</p>
                                    <Link to="/courses" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-900/50 hover:scale-105">
                                        <BookOpen size={20} />
                                        {t('courses.my_courses')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Typing Game Widget */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 rounded-3xl p-6 border border-purple-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-purple-500/50 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

                        <div className="relative z-10 w-full">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                <Zap className="text-purple-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('dashboard.typing_speed')}</h3>
                            <p className="text-slate-400 text-sm mb-6">{t('dashboard.compete_leaderboard')}</p>

                            <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-purple-500/20">
                                <div className="text-5xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-1">
                                    {user?.last_wpm || 0}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">{t('dashboard.wpm_last')}</div>
                            </div>

                            <Link to="/typing" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-900/50 group-hover:scale-105">
                                <Play size={18} className="fill-white" />
                                {t('typing.start')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Exams Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card md:col-span-2 bg-slate-800/50 border-slate-700">
                        <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
                            <BookOpen className="text-red-400" />
                            {t('dashboard.current_exams')}
                        </h3>
                        <div className="p-12 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                                <span className="text-4xl">📝</span>
                            </div>
                            <p className="text-lg">{t('dashboard.no_exams')}</p>
                            <p className="text-sm text-slate-600 mt-2">Check back later for new challenges!</p>
                        </div>
                    </div>
                </div>
            </div>

            <AIChatWidget />
        </>
    );
};

export default Dashboard;
