import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import {
    Users,
    BookOpen,
    FileText,
    ShoppingBag,
    TrendingUp,
    UserPlus,
    Plus,
    Activity,
    Award,
    Calendar
} from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
    // const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
        totalCourses: 0,
        activeCourses: 0,
        totalGroups: 0,
        activeGroups: 0,
        pendingHomework: 0,
        totalSubmissions: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch users
            const usersResponse = await api.get('/users/');
            const users = usersResponse.data;

            // Fetch courses
            const coursesResponse = await api.get('/admin/courses/');
            const courses = coursesResponse.data;

            // Fetch groups
            const groupsResponse = await api.get('/groups/');
            const groups = groupsResponse.data;

            // Fetch homework submissions
            const homeworkResponse = await api.get('/admin/homework/');
            const submissions = homeworkResponse.data;

            setStats({
                totalUsers: users.length,
                totalStudents: users.filter(u => u.role === 'STUDENT').length,
                totalTeachers: users.filter(u => u.role === 'TEACHER').length,
                totalAdmins: users.filter(u => u.role === 'ADMIN').length,
                totalCourses: courses.length,
                activeCourses: courses.filter(c => c.is_active).length,
                totalGroups: groups.length,
                activeGroups: groups.filter(g => g.is_active).length,
                pendingHomework: submissions.filter(s => s.status === 'SUBMITTED').length,
                totalSubmissions: submissions.length,
            });

            // Create recent activity from submissions
            const recentSubmissions = submissions
                .slice(0, 5)
                .map(s => ({
                    type: 'homework',
                    message: `${s.student_name} submitted homework for ${s.lesson_title}`,
                    time: new Date(s.created_at),
                    status: s.status,
                }));

            setRecentActivity(recentSubmissions);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Activity className="text-red-500" />
                    Admin Dashboard
                </h1>
                <p className="text-slate-400 mt-1">Welcome to MarsSpace Control Center</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="text-blue-400"
                    link="/admin-panel/users"
                    loading={loading}
                />
                <StatCard
                    title="Active Courses"
                    value={`${stats.activeCourses}/${stats.totalCourses}`}
                    icon={BookOpen}
                    color="text-green-400"
                    link="/admin-panel/courses"
                    loading={loading}
                />
                <StatCard
                    title="Study Groups"
                    value={stats.totalGroups}
                    icon={Users}
                    color="text-purple-400"
                    link="/admin-panel/groups"
                    loading={loading}
                />
                <StatCard
                    title="Pending Homework"
                    value={stats.pendingHomework}
                    icon={FileText}
                    color="text-yellow-400"
                    link="/admin-panel/homework"
                    loading={loading}
                />
            </div>

            {/* User Stats */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="text-blue-400" />
                    User Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="text-slate-400 text-sm">Students</div>
                        <div className="text-2xl font-bold text-green-400 mt-1">
                            {loading ? '...' : stats.totalStudents}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {loading ? '' : `${((stats.totalStudents / stats.totalUsers) * 100).toFixed(1)}% of total`}
                        </div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="text-slate-400 text-sm">Teachers</div>
                        <div className="text-2xl font-bold text-blue-400 mt-1">
                            {loading ? '...' : stats.totalTeachers}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {loading ? '' : `${((stats.totalTeachers / stats.totalUsers) * 100).toFixed(1)}% of total`}
                        </div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="text-slate-400 text-sm">Admins</div>
                        <div className="text-2xl font-bold text-red-400 mt-1">
                            {loading ? '...' : stats.totalAdmins}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {loading ? '' : `${((stats.totalAdmins / stats.totalUsers) * 100).toFixed(1)}% of total`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-red-400" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QuickAction
                        title="Create New User"
                        description="Add a new student, teacher, or admin"
                        icon={UserPlus}
                        link="/admin-panel/users"
                        color="text-blue-400"
                    />
                    <QuickAction
                        title="Create New Course"
                        description="Add a new course to the platform"
                        icon={Plus}
                        link="/admin-panel/courses"
                        color="text-green-400"
                    />
                    <QuickAction
                        title="Create Study Group"
                        description="Set up a new study group"
                        icon={Users}
                        link="/admin-panel/groups"
                        color="text-purple-400"
                    />
                    <QuickAction
                        title="Review Homework"
                        description="Check pending homework submissions"
                        icon={FileText}
                        link="/admin-panel/homework"
                        color="text-yellow-400"
                    />
                </div>
            </div>

            {/* Recent Activity & Homework Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="text-blue-400" />
                        Recent Activity
                    </h2>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-slate-400 text-center py-4">Loading...</div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-slate-400 text-center py-4">No recent activity</div>
                        ) : (
                            recentActivity.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg"
                                >
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <FileText className="text-blue-400" size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm text-white">{activity.message}</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {formatTimeAgo(activity.time)}
                                        </div>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded ${activity.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                        activity.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {activity.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Homework Stats */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="text-yellow-400" />
                        Homework Overview
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <FileText className="text-blue-400" size={20} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Total Submissions</div>
                                    <div className="text-xl font-bold text-white">
                                        {loading ? '...' : stats.totalSubmissions}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                    <Activity className="text-yellow-400" size={20} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Pending Review</div>
                                    <div className="text-xl font-bold text-yellow-400">
                                        {loading ? '...' : stats.pendingHomework}
                                    </div>
                                </div>
                            </div>
                            {stats.pendingHomework > 0 && (
                                <Link
                                    to="/admin-panel/homework"
                                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
                                >
                                    Review
                                </Link>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <ShoppingBag className="text-purple-400" size={20} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Active Groups</div>
                                    <div className="text-xl font-bold text-purple-400">
                                        {loading ? '...' : stats.activeGroups}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="text-slate-400">Platform Version</div>
                        <div className="text-white font-medium">v2.0.0 Alpha</div>
                    </div>
                    <div>
                        <div className="text-slate-400">Last Updated</div>
                        <div className="text-white font-medium">January 27, 2026</div>
                    </div>
                    <div>
                        <div className="text-slate-400">Status</div>
                        <div className="text-green-400 font-medium flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Operational
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, link, loading }) => {
    const Icon = icon;
    return (
        <Link
            to={link}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-all hover:scale-105"
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-slate-400 text-sm mb-1">{title}</div>
                    <div className={`text-3xl font-bold ${color}`}>
                        {loading ? '...' : value}
                    </div>
                </div>
                <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
                    <Icon className={color} size={28} />
                </div>
            </div>
        </Link>
    );
};

const QuickAction = ({ title, description, icon, link, color }) => {
    const Icon = icon;
    return (
        <Link
            to={link}
            className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all hover:scale-105 flex items-center gap-4"
        >
            <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
                <Icon className={color} size={24} />
            </div>
            <div>
                <div className="font-medium text-white">{title}</div>
                <div className="text-sm text-slate-400">{description}</div>
            </div>
        </Link>
    );
};

export default AdminDashboard;
