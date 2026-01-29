import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, Calendar, Clock } from 'lucide-react';

const MyGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/study_groups/');
            setGroups(res.data);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading groups...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">My Groups</h1>
                <p className="text-slate-500">Manage your study groups and track student progress</p>
            </div>

            {groups.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No Groups Yet</h3>
                    <p className="text-slate-500">You haven't been assigned to any groups yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <div key={group.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="h-24 bg-gradient-to-br from-orange-500 to-red-600"></div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{group.name}</h3>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{group.description}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Users size={16} className="text-orange-500" />
                                        <span>{group.students?.length || 0} students</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar size={16} className="text-orange-500" />
                                        <span>{group.days_of_week?.join(', ') || 'No schedule'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Clock size={16} className="text-orange-500" />
                                        <span>{group.start_time} - {group.end_time}</span>
                                    </div>
                                </div>

                                <Link
                                    to={`/teacher/attendance/${group.id}`}
                                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-2.5 rounded-lg font-medium transition-all"
                                >
                                    Mark Attendance
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyGroups;
