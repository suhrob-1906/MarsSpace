import { useState, useEffect } from 'react';
import { Users, Clock, BookOpen, AlertCircle, CheckCircle, XCircle, FileText, Target } from 'lucide-react';
import api from '../../services/api';
import CountdownTimer from '../../components/CountdownTimer';
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
                    api.get('/homework-submissions/') // Use correct endpoint for homework submissions
                ]);

                setStats(statsRes.data);

                // Handle pagination if present
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
        return lesson.seconds_until < (60 * 15); // Show "Now" if within 15 mins
    };

    // Calculate end date for countdown
    const getNextLessonDate = () => {
        if (!stats.next_lesson || stats.next_lesson.seconds_until === undefined) return null;
        return new Date(Date.now() + stats.next_lesson.seconds_until * 1000).toISOString();
    };

    if (loading) return <div className="text-center text-slate-400 py-10">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Teacher Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Students */}
                <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg shadow-blue-500/5 hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                            <Users className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-800">{stats?.total_students || 0}</div>
                            <div className="text-sm text-slate-500">Total Students</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-lg shadow-green-500/5 hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                            <Target className="text-green-500" size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-800">{stats?.active_groups || 0}</div>
                            <div className="text-sm text-slate-500">Active Groups</div>
                        </div>
                    </div>
                </div>

                {/* Next Lesson */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm col-span-1 md:col-span-1">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Clock className="text-orange-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Next Lesson</h3>
                                {stats.next_lesson ? (
                                    <p className="text-sm text-slate-500">
                                        {stats.next_lesson.group_name}
                                    </p>
                                ) : (
                                    <p className="text-sm text-slate-400">No upcoming lessons</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {stats.next_lesson && (
                        <div className="mt-4">
                            <CountdownTimer endDate={getNextLessonDate()} />
                            <div className="mt-4 flex gap-2">
                                <Link
                                    to={`/teacher/attendance/${stats.next_lesson.group_id}`}
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
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
                    <AlertCircle className="text-green-600" size={24} />
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-800">Class is starting soon!</h4>
                        <p className="text-sm text-slate-600">
                            Don't forget to mark attendance for <strong>{stats.next_lesson.group_name}</strong>.
                        </p>
                    </div>
                    <Link to={`/teacher/attendance/${stats.next_lesson.group_id}`} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Go to Attendance
                    </Link>
                </div>
            )}

            {/* Recent Submissions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Recent Homework Submissions</h3>
                {submissions.length > 0 ? (
                    <div className="space-y-4">
                        {submissions.map((sub) => (
                            <div key={sub.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{sub.student_name || 'Student'}</div>
                                        <div className="text-sm text-slate-500">{sub.homework_title || 'Homework'}</div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${sub.grade ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {sub.grade ? `Graded: ${sub.grade}` : 'Needs Grading'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-center py-8">No recent submissions found.</p>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
