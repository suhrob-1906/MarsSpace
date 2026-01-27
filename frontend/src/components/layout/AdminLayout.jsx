import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Users,
    BookOpen,
    ShoppingBag,
    FileText,
    LogOut,
    LayoutDashboard,
    Video,
    Settings
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/admin-panel', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin-panel/courses', label: 'Courses', icon: BookOpen },
        { path: '/admin-panel/groups', label: 'Groups', icon: Users },
        { path: '/admin-panel/eduverse', label: 'Eduverse', icon: Video },
        { path: '/admin-panel/shop', label: 'Shop', icon: ShoppingBag },
        { path: '/admin-panel/homework', label: 'Homework', icon: FileText },
        { path: '/admin-panel/users', label: 'Users', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-lg z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 text-white p-2 rounded-lg font-bold shadow-glow-red">ADMIN</div>
                    <span className="text-xl font-bold text-white tracking-wide">MarsSpace Control</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="font-bold text-white">{user?.username}</div>
                        <div className="text-xs text-red-400 font-mono tracking-wider">ADMINISTRATOR</div>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col">
                    <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-4 pt-2">
                            Management
                        </div>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${isActive(item.path)
                                            ? 'bg-red-600/10 text-red-400 border border-red-600/20'
                                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-slate-700">
                        <div className="text-xs text-slate-600 text-center">
                            v2.0.0 Alpha
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto bg-slate-900 text-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
