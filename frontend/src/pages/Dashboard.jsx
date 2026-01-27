import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t('dashboard.welcome')}, {user?.username}!</h1>
                        <p className="text-slate-400">Track your progress and achievements</p>
                    </div>

                    {/* Season Countdown */}
                    {season && (
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <p className="text-sm text-slate-400 mb-2">{t('season.title')}: <span className="text-primary font-bold">{season.title}</span></p>
                            <CountdownTimer
                                endDate={season.end_date}
                                timeRemaining={season.time_remaining}
                            />
                        </div>
                    )}
                </div>

                <SubscriptionCard user={user} onPurchaseSuccess={handlePurchaseSuccess} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Hero Card */}
                    <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 border border-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10">
                            {recentProgress ? (
                                <>
                                    <div className="flex items-start justify-between mb-8">
                                        <div>
                                            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3">
                                                {recentProgress.course_title?.toUpperCase() || 'COURSE'}
                                            </span>
                                            <h3 className="text-2xl font-bold text-white mb-2">Lesson {recentProgress.current_lesson_index}</h3>
                                            <p className="text-indigo-200/70 max-w-md">
                                                {t('courses.continue')}
                                            </p>
                                        </div>
                                        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center relative">
                                            <span className="text-lg font-bold text-white">{getProgressPercent(recentProgress)}%</span>
                                        </div>
                                    </div>

                                    <Link to={`/courses/${recentProgress.course}`} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                                        <Play size={20} className="fill-indigo-900" />
                                        {t('courses.continue')}
                                    </Link>
                                </>
                            ) : (
                                <div className="flex flex-col items-start">
                                    <h3 className="text-2xl font-bold text-white mb-4">{t('dashboard.welcome')} MarsSpace!</h3>
                                    <p className="text-indigo-200/70 mb-6">{t('courses.start_learning')}</p>
                                    <Link to="/courses" className="btn btn-primary">{t('courses.my_courses')}</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Typing Game Widget */}
                    <div className="bg-gradient-to-br from-purple-900/30 to-slate-900 rounded-3xl p-6 border border-purple-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                        <div className="relative z-10 w-full">
                            <h3 className="text-lg font-bold text-white mb-1">{t('dashboard.typing_speed')}</h3>
                            <p className="text-slate-400 text-sm mb-6">{t('dashboard.compete_leaderboard')}</p>

                            <div className="mb-6">
                                <div className="text-4xl font-black text-primary mb-1">{user?.last_wpm || 0}</div>
                                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">{t('dashboard.wpm_last')}</div>
                            </div>

                            <Link to="/typing" className="w-full btn btn-primary group-hover:scale-105 transition-transform">
                                {t('typing.start')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Exams Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card md:col-span-2">
                        <h3 className="font-bold text-white mb-4">{t('dashboard.current_exams')}</h3>
                        <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">📝</span>
                            </div>
                            <p>{t('dashboard.no_exams')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <AIChatWidget />
        </>
    );
};

export default Dashboard;
