import { useEffect, useState } from 'react';
import api from '../services/api';
import { BookOpen, ChevronRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [myGroups, setMyGroups] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/courses/'),
            api.get('/study_groups/')
        ])
            .then(([coursesRes, groupsRes]) => {
                setCourses(coursesRes.data);
                setMyGroups(groupsRes.data.results || groupsRes.data);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
            <h1 className="text-3xl font-black text-slate-800">My Courses</h1>

            {/* My Groups Info */}
            {myGroups.length > 0 && (
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="text-orange-600" />
                        My Study Group
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {myGroups.map(group => (
                            <div key={group.id} className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-slate-800 text-lg">{group.name}</div>
                                    <div className="text-sm text-slate-500">
                                        {group.days_of_week.join(', ')} • {group.start_time}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Teacher</div>
                                    <div className="font-bold text-orange-600">
                                        {group.teacher_details ? `${group.teacher_details.first_name} ${group.teacher_details.last_name}` : 'No teacher'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                            <BookOpen size={30} />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-1">{course.title}</h3>
                            <p className="text-slate-500 text-sm">{course.description}</p>
                        </div>

                        <Link to={`/courses/${course.id}`} className="bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2">
                            Start Learning <ChevronRight size={18} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
