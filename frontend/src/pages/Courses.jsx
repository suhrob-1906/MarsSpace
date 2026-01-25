import { useEffect, useState } from 'react';
import api from '../services/api';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Courses = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        api.get('/courses/')
            .then(res => setCourses(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Available Courses</h1>

            <div className="grid gap-4">
                {courses.map(course => (
                    <div key={course.id} className="card flex items-center gap-6 p-6 hover:border-primary/50 transition-colors group">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                            <BookOpen size={32} />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{course.title}</h3>
                            <p className="text-slate-400 text-sm">{course.description}</p>
                        </div>

                        <Link to={`/courses/${course.id}`} className="btn btn-secondary group-hover:bg-primary group-hover:text-white">
                            Start Learning <ChevronRight size={16} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
