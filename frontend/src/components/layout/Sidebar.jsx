import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ShoppingBag, Globe, Trophy, LogOut, Code2, Tent } from 'lucide-react';
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
        { name: 'Space Shop', path: '/shop', icon: ShoppingBag },
    ];

    if (user?.role === 'TEACHER') {
        navItems.push({ name: 'Teacher Panel', path: '/teacher', icon: Tent }); // Placeholder icon
    }
    if (user?.role === 'ADMIN') {
        navItems.push({ name: 'Admin Panel', path: '/admin-panel', icon: Trophy });
    }

    return (
        <div className="w-64 bg-surface border-r border-slate-700/50 flex flex-col h-screen fixed left-0 top-0 overflow-hidden">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-xl">
                    S
                </div>
                <h1 className="text-xl font-bold text-white tracking-wide">SPACE</h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path; // Exact match for simplicity
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon size={20} className={clsx(isActive ? "text-primary" : "group-hover:text-white transition-colors")} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-700/50">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
