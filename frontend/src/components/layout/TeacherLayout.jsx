import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Calendar, LogOut, LayoutDashboard, Clock } from 'lucide-react';

const TeacherLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/teacher/groups', label: 'My Groups', icon: Users },
        // { path: '/teacher/attendance', label: 'Attendance', icon: Clock }, // Redirect to groups for attendance
        { path: '/teacher/schedule', label: 'Schedule', icon: Calendar },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-lg font-bold">MS</div>
                    <span className="text-xl font-bold text-slate-800">Teacher Panel</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="font-bold text-slate-800">{user?.username}</div>
                        <div className="text-xs text-slate-500">Teacher</div>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-slate-200 hidden md:block">
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive(item.path)
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TeacherLayout;
