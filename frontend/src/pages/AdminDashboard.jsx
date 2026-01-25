import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, BookOpen, ShoppingBag, Plus, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, courses: 0, orders: 0 });
    const [activeTab, setActiveTab] = useState('users'); // users, courses, shop

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Admin Panel</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{users.length || 0}</div>
                        <div className="text-sm text-slate-400">Total Users</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">3</div>
                        <div className="text-sm text-slate-400">Active Courses</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">1,050</div>
                        <div className="text-sm text-slate-400">Shop Orders</div>
                    </div>
                </div>
            </div>

            {/* Management Tabs */}
            <div className="bg-surface rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="flex border-b border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-4 font-medium transition-colors ${activeTab === 'users' ? 'bg-slate-800 text-white border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                    >
                        Users Management
                    </button>
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-6 py-4 font-medium transition-colors ${activeTab === 'courses' ? 'bg-slate-800 text-white border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                    >
                        Courses
                    </button>
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`px-6 py-4 font-medium transition-colors ${activeTab === 'shop' ? 'bg-slate-800 text-white border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                    >
                        Shop Items
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex justify-between mb-4">
                                <h3 className="font-bold text-white">Users Directory</h3>
                                <button className="btn btn-primary text-sm"><Plus size={16} /> Add User</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-slate-500 text-sm border-b border-slate-700">
                                        <tr>
                                            <th className="pb-3 pl-2">Username</th>
                                            <th className="pb-3">Role</th>
                                            <th className="pb-3">Balance</th>
                                            <th className="pb-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-300">
                                        {users.map(u => (
                                            <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                                <td className="py-3 pl-2 font-medium text-white">{u.username}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-300' :
                                                            u.role === 'TEACHER' ? 'bg-blue-500/20 text-blue-300' :
                                                                'bg-green-500/20 text-green-300'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 font-mono text-amber-500">
                                                    {u.wallet?.coins || 0} 🪙
                                                </td>
                                                <td className="py-3 text-slate-500">
                                                    <button className="hover:text-white">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'courses' && (
                        <div className="text-center py-10 text-slate-500">
                            Course Management Placeholder
                        </div>
                    )}
                    {activeTab === 'shop' && (
                        <div className="text-center py-10 text-slate-500">
                            Shop Items CRUD Placeholder
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
