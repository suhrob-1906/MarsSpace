import { useEffect, useState } from 'react';
import { Play, Trophy, Zap, Target, BookOpen, Clock, Users } from 'lucide-react';
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
    const [myGroups, setMyGroups] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [progressRes, leaderboardRes, groupsRes] = await Promise.all([
                    api.get('/my-progress/'),
                    api.get('/leaderboard/'),
                    api.get('/study_groups/')
                ]);

                if (progressRes.data.length > 0) {
                    setRecentProgress(progressRes.data[0]);
                }
                if (leaderboardRes.data.season) {
                    setSeason(leaderboardRes.data.season);
                }
                setMyGroups(groupsRes.data.results || groupsRes.data);
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
                        <h1 className="text-4xl font-black text-slate-800 mb-2">
                            {t('dashboard.welcome')}, <span className="text-orange-600">{user?.username}</span>!
                        </h1>
                        <p className="text-slate-500 text-lg">Track your progress and achievements on Mars 🚀</p>
                    </div>

                    {/* Season Countdown */}
                    {season && (
                        <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-lg shadow-orange-500/5">
                            <p className="text-sm text-slate-500 mb-2 font-medium">
                                {t('season.title')}: <span className="text-orange-600 font-bold">{season.title}</span>
                            </p>
                            <CountdownTimer endDate={season.end_date} />
                        </div>
                    )}
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-lg shadow-blue-500/5 hover:scale-105 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Trophy className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{user?.points || 0}</div>
                                <div className="text-xs text-slate-500">Points</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-yellow-100 shadow-lg shadow-yellow-500/5 hover:scale-105 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                                <Zap className="text-yellow-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{user?.coins || 0}</div>
                                <div className="text-xs text-slate-500">Coins</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-green-100 shadow-lg shadow-green-500/5 hover:scale-105 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                <Target className="text-green-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{user?.activity_days || 0}</div>
                                <div className="text-xs text-slate-500">Day Streak</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-lg shadow-purple-500/5 hover:scale-105 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                                <Clock className="text-purple-500" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{user?.last_wpm || 0}</div>
                                <div className="text-xs text-slate-500">WPM</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Groups / Teacher Info */}
                {myGroups.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-lg shadow-orange-500/5">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Users size={20} className="text-orange-500" />
                            My Study Groups
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {myGroups.map(group => (
                                <div key={group.id} className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800">{group.name}</div>
                                        <div className="text-sm text-slate-500">
                                            {group.days_of_week.join(', ')} • {group.start_time}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500">Teacher</div>
                                        <div className="font-medium text-orange-600">
                                            {group.teacher_details ? `${group.teacher_details.first_name} ${group.teacher_details.last_name}` : 'No teacher'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <SubscriptionCard user={user} onPurchaseSuccess={handlePurchaseSuccess} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Hero Card */}
                    <div className="md:col-span-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 shadow-xl shadow-orange-500/20 relative overflow-hidden group hover:scale-[1.01] transition-all">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 w-full">
                            {recentProgress ? (
                                <>
                                    <div className="flex items-start justify-between mb-8">
                                        <div>
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-bold mb-4 backdrop-blur-sm">
                                                <BookOpen size={16} />
                                                {recentProgress.course_title?.toUpperCase() || 'COURSE'}
                                            </span>
                                            <h3 className="text-3xl font-black text-white mb-3">Lesson {recentProgress.current_lesson_index}</h3>
                                            <p className="text-white/90 max-w-md text-lg">
                                                {t('courses.continue')}
                                            </p>
                                        </div>
                                        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center relative backdrop-blur-sm border border-white/30 text-white">
                                            <span className="text-2xl font-black">{getProgressPercent(recentProgress)}%</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-6 bg-black/20 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full bg-white rounded-full transition-all duration-500"
                                            style={{ width: `${getProgressPercent(recentProgress)}%` }}
                                        />
                                    </div>

                                    <Link to={`/courses/${recentProgress.course}`} className="inline-flex items-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-lg hover:scale-105">
                                        <Play size={20} className="fill-orange-600" />
                                        {t('courses.continue')}
                                    </Link>
                                </>
                            ) : (
                                <div className="flex flex-col items-start w-full">
                                    <h3 className="text-3xl font-black text-white mb-4">{t('dashboard.welcome')} MarsSpace! 🚀</h3>
                                    <p className="text-white/90 mb-8 text-lg">Start your coding journey on Mars today!</p>
                                    <Link to="/courses" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-lg hover:scale-105">
                                        <BookOpen size={20} />
                                        {t('courses.my_courses')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Typing Game Widget */}
                    <div className="bg-white rounded-3xl p-6 border border-purple-100 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-xl hover:shadow-purple-500/5 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />

                        <div className="relative z-10 w-full">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-50 flex items-center justify-center">
                                <Zap className="text-purple-500" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('dashboard.typing_speed')}</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-[200px] mx-auto">{t('dashboard.compete_leaderboard')}</p>

                            <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <div className="text-5xl font-black text-slate-800 mb-1">
                                    {user?.last_wpm || 0}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">{t('dashboard.wpm_last')}</div>
                            </div>

                            <Link to="/typing" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg group-hover:scale-105">
                                <Play size={18} className="fill-white" />
                                Play Now
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Exams Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-500/5">
                        <h3 className="font-bold text-slate-800 mb-4 text-xl flex items-center gap-2">
                            <BookOpen className="text-orange-500" />
                            {t('dashboard.current_exams')}
                        </h3>
                        <div className="p-12 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-400">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                                <span className="text-4xl">📝</span>
                            </div>
                            <p className="text-lg font-medium text-slate-600">{t('dashboard.no_exams')}</p>
                            <p className="text-sm mt-2">Check back later for new challenges!</p>
                        </div>
                    </div>
                </div>
            </div>

            <AIChatWidget />
        </>
    );
};

export default Dashboard;
