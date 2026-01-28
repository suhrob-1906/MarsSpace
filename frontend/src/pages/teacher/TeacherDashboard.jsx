import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const TeacherDashboard = () => {
    const { user } = useAuth();
    // const { t } = useTranslation();
    const [todayClasses, setTodayClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTodayClasses();
    }, []);

    const fetchTodayClasses = async () => {
        try {
            // Fetch groups and filter for today
            // Ideally backend should provide this endpoint
            const res = await api.get('/study_groups/');
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

            const classes = res.data.filter(g => g.days_of_week?.includes(today));
            setTodayClasses(classes);
        } catch (error) {
            console.error("Failed to fetch classes", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {user?.first_name || 'Teacher'}! 👋</h1>
            <p className="text-slate-500 mb-8">Here's what's happening today.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Calendar size={24} />
                        </div>
                        <span className="text-sm font-medium opacity-80">Today</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{todayClasses.length}</div>
                    <div className="text-sm opacity-90">Classes Scheduled</div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">0</div>
                    <div className="text-sm text-slate-500">Students Active</div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">--</div>
                    <div className="text-sm text-slate-500">Next Class</div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-4">Today's Classes</h2>
            {loading ? (
                <div className="text-center py-8">Loading schedule...</div>
            ) : todayClasses.length > 0 ? (
                <div className="grid gap-4">
                    {todayClasses.map(group => (
                        <div key={group.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg font-bold text-lg w-16 text-center">
                                    {group.start_time?.slice(0, 5)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{group.name}</h3>
                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                        <Users size={14} /> {group.students_count} Students
                                    </div>
                                </div>
                            </div>
                            <Link
                                to={`/teacher/attendance/${group.id}`}
                                className="btn btn-outline text-sm flex items-center gap-2"
                            >
                                Mark Attendance <ArrowRight size={16} />
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <h3 className="font-medium text-slate-900">No classes scheduled for today</h3>
                    <p className="text-slate-500 text-sm">Enjoy your day off!</p>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
