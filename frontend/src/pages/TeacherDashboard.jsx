import { useState, useEffect } from 'react';
import { Users, Clock, BookOpen, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';
import api from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
    const [stats, setStats] = useState({
        total_students: 0,
        active_groups: 0,
        next_lesson: null
    });
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, homeworkRes] = await Promise.all([
                    api.get('/teacher/stats/'),
                    api.get('/homework-submissions/')  // Fixed: use homework-submissions instead of admin endpoint
                ]);

                setStats(statsRes.data);

                // Get submissions data
                const subData = homeworkRes.data.results || homeworkRes.data;
                setSubmissions(Array.isArray(subData) ? subData.slice(0, 10) : []);

            } catch (error) {
                console.error("Failed to fetch teacher dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const isLessonNow = (lesson) => {
        if (!lesson) return false;
        // If seconds until is 0 or negative (but logically handled by backend returning 0 for "now")
        // Actually backend logic sets days_ahead to 7 if passed, so we trust seconds_until
        return lesson.seconds_until < (60 * 15); // Show "Now" if within 15 mins
    };

    if (loading) return <div className="text-center text-slate-400 py-10">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-500/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm mb-1">Total Students</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.total_students}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-500/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm mb-1">Active Groups</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.active_groups}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                            <BookOpen className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-500/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm mb-1">Next Lesson</p>
                            {stats.next_lesson ? (
                                <div>
                                    <p className="text-lg font-bold text-slate-800">{stats.next_lesson.day_name}</p>
                                    <p className="text-sm text-slate-600">{stats.next_lesson.start_time}</p>
                                    <p className="text-xs text-slate-400 mt-1">{stats.next_lesson.group_name}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">No upcoming lessons</p>
                            )}
                        </div>
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                            <Clock className="text-orange-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Warning / Action */}
            {stats.next_lesson && stats.next_lesson.seconds_until < 900 && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-4">
                    <AlertCircle className="text-green-400" size={24} />
                    <div className="flex-1">
                        <h4 className="font-bold text-white">Class is starting soon!</h4>
                        <p className="text-sm text-slate-300">
                            Don't forget to mark attendance for <strong>{stats.next_lesson.group_name}</strong>.
                        </p>
                    </div>
                    <Link to="/teacher/attendance" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Go to Attendance
                    </Link>
                </div>
            )}

            {/* Homework Submissions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-500/5">
                <h3 className="font-bold text-slate-800 mb-4 text-xl">Homework Submissions</h3>

                {submissions.length > 0 ? (
                    <div className="space-y-3">
                        {submissions.map((submission) => (
                            <div
                                key={submission.id}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800">
                                        {submission.student_name || 'Unknown Student'}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {submission.homework_title || 'Homework'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Submitted: {new Date(submission.submitted_at).toLocaleDateString('ru-RU', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {submission.status === 'graded' ? (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                            ✓ Проверено
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                                            ⏳ На проверке
                                        </span>
                                    )}
                                    {submission.points_awarded && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                            {submission.points_awarded} pts
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <FileText size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No homework submissions yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
