import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import api from '../../services/api';

const SchedulePage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await api.get('/study_groups/');
            const groupsData = response.data.results || response.data;
            setGroups(Array.isArray(groupsData) ? groupsData : []);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    // Organize groups by day
    const getGroupsForDay = (day) => {
        return groups.filter(group =>
            group.days_of_week && group.days_of_week.includes(day) && group.is_active
        ).sort((a, b) => {
            // Sort by start time
            if (a.start_time < b.start_time) return -1;
            if (a.start_time > b.start_time) return 1;
            return 0;
        });
    };

    if (loading) {
        return <div className="text-center text-slate-400 py-10">Loading schedule...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Calendar className="text-indigo-400" />
                        Weekly Schedule
                    </h1>
                    <p className="text-slate-400 mt-1">Your teaching schedule for the week</p>
                </div>
            </div>

            {/* Weekly Calendar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {daysOfWeek.map((day, index) => {
                    const dayGroups = getGroupsForDay(day);

                    return (
                        <div key={day} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            {/* Day Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                                <h3 className="font-bold text-white text-lg">{dayLabels[index]}</h3>
                                <p className="text-indigo-100 text-sm">{day}</p>
                            </div>

                            {/* Lessons for this day */}
                            <div className="p-4 space-y-3">
                                {dayGroups.length > 0 ? (
                                    dayGroups.map(group => (
                                        <div
                                            key={group.id}
                                            className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:border-indigo-500/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-indigo-400" />
                                                    <h4 className="font-bold text-white text-sm">{group.name}</h4>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Clock size={14} />
                                                    <span>{group.start_time?.slice(0, 5)} - {group.end_time?.slice(0, 5)}</span>
                                                </div>

                                                {group.description && (
                                                    <div className="flex items-start gap-2 text-xs text-slate-500">
                                                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                                        <span className="line-clamp-2">{group.description}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                                                    <span className="text-xs text-slate-500">
                                                        {group.students_count || 0} students
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                                                        Active
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No lessons</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="font-bold text-white mb-4">Week Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-indigo-400">{groups.filter(g => g.is_active).length}</div>
                        <div className="text-sm text-slate-400">Active Groups</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-400">
                            {groups.reduce((total, group) => {
                                return total + (group.days_of_week?.length || 0);
                            }, 0)}
                        </div>
                        <div className="text-sm text-slate-400">Weekly Lessons</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-400">
                            {groups.reduce((total, group) => total + (group.students_count || 0), 0)}
                        </div>
                        <div className="text-sm text-slate-400">Total Students</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-400">
                            {new Set(groups.flatMap(g => g.days_of_week || [])).size}
                        </div>
                        <div className="text-sm text-slate-400">Teaching Days</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulePage;
