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
                    api.get('/admin/homework/submissions/') // Reusing existing endpoint or need a filtered one
                ]);

                setStats(statsRes.data);

                // If the user is teacher, the list call typically returns submissions for their groups
                // based on the queryset we saw earlier
                const subData = homeworkRes.data.results || homeworkRes.data;
                setSubmissions(Array.isArray(subData) ? subData.slice(0, 5) : []);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Students */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-2xl p-6 border border-indigo-500/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Users className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">{stats.total_students}</div>
                            <div className="text-sm text-slate-400">Total Students</div>
                        </div>
                    </div>
                </div>

                {/* Active Groups */}
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 rounded-2xl p-6 border border-purple-500/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <BookOpen className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">{stats.active_groups}</div>
                            <div className="text-sm text-slate-400">Active Groups</div>
                        </div>
                    </div>
                </div>

                {/* Next Lesson */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-2xl p-6 border border-indigo-500/20 col-span-1 md:col-span-1">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <Clock className="text-orange-400" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Next Lesson</h3>
                                {stats.next_lesson ? (
                                    <p className="text-sm text-slate-400">
                                        {stats.next_lesson.group_name}
                                    </p>
                                ) : (
                                    <p className="text-sm text-slate-500">No upcoming lessons</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {stats.next_lesson && (
                        <div className="mt-4">
                            <CountdownTimer endDate={stats.next_lesson.start} />
                            <div className="mt-4 flex gap-2">
                                <Link
                                    to="/teacher/attendance"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Mark Attendance
                                </Link>
                            </div>
                        </div>
                    )}
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

            {/* Recent Submissions */}
            <div className="card">
                <h3 className="font-bold text-white mb-4">Recent Homework Submissions</h3>
                {submissions.length > 0 ? (
                    <div className="space-y-4">
                        {submissions.map((sub) => (
                            <div key={sub.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{sub.student_name || 'Student'}</div>
                                        <div className="text-sm text-slate-400">{sub.homework_title || 'Homework'}</div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${sub.grade ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
                                    }`}>
                                    {sub.grade ? `Graded: ${sub.grade}` : 'Needs Grading'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-8">No recent submissions found.</p>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
