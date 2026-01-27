import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, Plus, Edit, Trash2, X, Save, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        days_of_week: [],
        start_time: '09:00',
        end_time: '10:00',
        teacher_id: '',
        is_active: true
    });

    const daysOptions = [
        { value: 'Monday', label: 'Mon' },
        { value: 'Tuesday', label: 'Tue' },
        { value: 'Wednesday', label: 'Wed' },
        { value: 'Thursday', label: 'Thu' },
        { value: 'Friday', label: 'Fri' },
        { value: 'Saturday', label: 'Sat' },
        { value: 'Sunday', label: 'Sun' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [groupsRes, teachersRes] = await Promise.all([
                api.get('/study_groups/'),
                api.get('/users/', { params: { role: 'TEACHER' } }) // Assuming filter exists or we filter client side
            ]);
            setGroups(groupsRes.data);

            // If backend doesn't support role filter yet, filter here
            const allUsers = teachersRes.data.results || teachersRes.data;
            const teacherList = Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'TEACHER') : [];
            setTeachers(teacherList);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (group = null) => {
        if (group) {
            setEditingGroup(group);
            setFormData({
                name: group.name,
                description: group.description,
                days_of_week: group.days_of_week || [],
                start_time: group.start_time || '09:00',
                end_time: group.end_time || '10:00',
                teacher_id: group.teacher || '', // Adjust if populated object
                is_active: group.is_active
            });
        } else {
            setEditingGroup(null);
            setFormData({
                name: '',
                description: '',
                days_of_week: [],
                start_time: '09:00',
                end_time: '10:00',
                teacher_id: '',
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // Ensure correct types if needed
            };

            if (editingGroup) {
                await api.patch(`/study_groups/${editingGroup.id}/`, payload);
                toast.success('Group updated');
            } else {
                await api.post('/study_groups/', payload);
                toast.success('Group created');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/study_groups/${id}/`);
            toast.success("Group deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const toggleDay = (day) => {
        setFormData(prev => {
            const days = prev.days_of_week.includes(day)
                ? prev.days_of_week.filter(d => d !== day)
                : [...prev.days_of_week, day];
            return { ...prev, days_of_week: days };
        });
    };

    if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Group Management</h1>
                    <p className="text-slate-400">Create groups, assign teachers, manage schedules</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-lg shadow-red-900/20"
                >
                    <Plus size={20} /> New Group
                </button>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-900/50 text-slate-400 text-sm font-medium border-b border-slate-700">
                        <tr>
                            <th className="px-6 py-4">Group Name</th>
                            <th className="px-6 py-4">Teacher</th>
                            <th className="px-6 py-4">Schedule</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {groups.map(group => (
                            <tr key={group.id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{group.name}</div>
                                    <div className="text-xs text-slate-500">{group.students_count || 0} Students</div>
                                </td>
                                <td className="px-6 py-4">
                                    {group.teacher ? (
                                        // Handle both ID and expanded object cases if API varies
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs">
                                                {typeof group.teacher === 'object' ? group.teacher.username[0] : 'T'}
                                            </div>
                                            <span>
                                                {typeof group.teacher === 'object'
                                                    ? group.teacher.username
                                                    : teachers.find(t => t.id === group.teacher)?.username || 'Unknown'}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 italic">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-sm">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar size={14} />
                                            <span>{group.days_of_week?.map(d => d.slice(0, 3)).join(', ') || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Clock size={14} />
                                            <span>{group.start_time?.slice(0, 5)} - {group.end_time?.slice(0, 5)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {group.is_active ? (
                                        <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs border border-green-500/20">Active</span>
                                    ) : (
                                        <span className="bg-slate-700 text-slate-400 px-2 py-1 rounded text-xs">Inactive</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(group)}
                                        className="p-2 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(group.id)}
                                        className="p-2 hover:bg-slate-700 rounded-lg text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl w-full max-w-lg border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">
                                {editingGroup ? 'Edit Group' : 'New Group'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Group Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 min-h-[80px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.start_time}
                                            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.end_time}
                                            onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Schedule Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {daysOptions.map(day => (
                                            <button
                                                key={day.value}
                                                type="button"
                                                onClick={() => toggleDay(day.value)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${formData.days_of_week.includes(day.value)
                                                        ? 'bg-red-600 border-red-500 text-white'
                                                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                                                    }`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Assign Teacher</label>
                                    <select
                                        value={formData.teacher_id}
                                        onChange={e => setFormData({ ...formData, teacher_id: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                    >
                                        <option value="">-- Select Teacher --</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher.id} value={teacher.id}>{teacher.username} ({teacher.first_name} {teacher.last_name})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-red-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-400">Group is Active</label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg mt-6 shadow-lg shadow-red-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> Save Group
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupManagement;
