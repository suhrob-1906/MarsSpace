import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ShoppingBag, Globe, Trophy, LogOut, Code2, Tent, MessageSquare, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Courses', path: '/courses', icon: BookOpen },
        { name: 'Typing Game', path: '/typing', icon: Code2 },
        { name: 'Eduverse', path: '/eduverse', icon: Globe },
        { name: 'Community Blogs', path: '/blogs', icon: MessageSquare },
        { name: 'Current Tasks', path: '/current-tasks', icon: BookOpen },
        { name: 'Space Shop', path: '/shop', icon: ShoppingBag },
    ];

    if (user?.role === 'TEACHER') {
        navItems.push({ name: 'Teacher Panel', path: '/teacher', icon: Tent });
        navItems.push({ name: 'Schedule', path: '/teacher/schedule', icon: Calendar });
    }
    if (user?.role === 'ADMIN') {
        navItems.push({ name: 'Admin Panel', path: '/admin-panel', icon: Trophy });
    }

    return (
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 overflow-hidden shadow-sm z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-orange-500/20">
                    S
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-wide">SPACE</h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                                isActive
                                    ? "bg-orange-50 text-orange-600"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            )}
                        >
                            <Icon size={20} className={clsx(isActive ? "text-orange-600" : "text-slate-400 group-hover:text-slate-600 transition-colors")} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-all font-medium"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
