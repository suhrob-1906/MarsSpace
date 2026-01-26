import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [recentProgress, setRecentProgress] = useState(null);
    const [stats] = useState({ wpm: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch progress
                // Since our API is list-based, let's just take the first one for hero section
                const progressRes = await api.get('/my-progress/');
                if (progressRes.data.length > 0) {
                    setRecentProgress(progressRes.data[0]);
                }

                // Fetch typing stats (leaderboard or specific endpoint if we had one)
                // For MVP we don't have a direct "my-stats" endpoint in game, so we might skip or use logic
                // But let's assume we want to show at least something real if possible.
                // For now, we'll keep WPM static or 0 until played.
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };
        fetchData();
    }, []);

    // Calculate progress percentage
    const getProgressPercent = (prog) => {
        if (!prog) return 0;
        // Assuming 12 lessons per course
        return Math.round((prog.completed_lessons_count / 12) * 100);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-slate-400">Track your progress and achievements</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">Current Season</p>
                    <div className="text-xl font-bold text-primary">Season 1: Awakening</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Hero Card: Continue Learning */}
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
                                            Continue where you left off.
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center relative">
                                        <span className="text-lg font-bold text-white">{getProgressPercent(recentProgress)}%</span>
                                    </div>
                                </div>

                                <Link to={`/courses/${recentProgress.course}`} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                                    <Play size={20} className="fill-indigo-900" />
                                    Continue Learning
                                </Link>
                            </>
                        ) : (
                            <div className="flex flex-col items-start">
                                <h3 className="text-2xl font-bold text-white mb-4">Welcome to Space!</h3>
                                <p className="text-indigo-200/70 mb-6">Start your first course to see progress here.</p>
                                <button className="btn btn-primary">Browse Courses</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Typing Game Widget */}
                <div className="bg-gradient-to-br from-purple-900/30 to-slate-900 rounded-3xl p-6 border border-purple-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                    <div className="relative z-10 w-full">
                        <h3 className="text-lg font-bold text-white mb-1">Typing Speed</h3>
                        <p className="text-slate-400 text-sm mb-6">Compete for the leaderboard!</p>

                        <div className="mb-6">
                            <div className="text-4xl font-black text-primary mb-1">{stats.wpm}</div>
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">WPM (Best)</div>
                        </div>

                        <Link to="/typing" className="w-full btn btn-primary group-hover:scale-105 transition-transform">
                            Play Typing
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tasks & Others */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="font-bold text-white mb-4">Pending Tasks</h3>
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-center text-slate-500 text-sm">
                        No pending homework
                    </div>
                </div>

                <div className="card">
                    <h3 className="font-bold text-white mb-4">Course Map</h3>
                    <div className="space-y-3">
                        {/* Placeholder for course map, could map recentProgress here too */}
                        <div className="text-slate-500 text-sm">Select a course to view map</div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
