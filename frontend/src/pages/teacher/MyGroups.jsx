import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Users, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyGroups = () => {
    // const { t } = useTranslation();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await api.get('/study_groups/');
            setGroups(response.data);
        } catch (error) {
            console.error("Failed to fetch groups", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading groups...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">My Groups</h1>

            {groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(group => (
                        <div key={group.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{group.name}</h3>
                                    <p className="text-sm text-slate-500">{group.description}</p>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${group.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {group.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <Calendar size={16} className="text-blue-500" />
                                    <span>{group.days_of_week?.join(', ') || 'No schedule'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <Clock size={16} className="text-orange-500" />
                                    <span>{group.start_time ? `${group.start_time} - ${group.end_time}` : 'Time not set'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <Users size={16} className="text-purple-500" />
                                    <span>{group.students_count || 0} Students</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    to={`/teacher/attendance/${group.id}`}
                                    className="flex-1 btn bg-blue-600 text-white hover:bg-blue-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    Mark Attendance <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No groups assigned</h3>
                    <p className="text-slate-500">You haven't been assigned to any study groups call an admin.</p>
                </div>
            )}
        </div>
    );
};

export default MyGroups;
