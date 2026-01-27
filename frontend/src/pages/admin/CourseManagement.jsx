import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookOpen, Plus, Edit, Trash2, X, Save, ArrowRight, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses/'); // Using admin endpoint
            setCourses(res.data.results || res.data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                title: course.title,
                description: course.description,
                order: course.order || 0,
                is_active: course.is_active
            });
        } else {
            setEditingCourse(null);
            setFormData({
                title: '',
                description: '',
                order: courses.length + 1,
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };

            if (editingCourse) {
                await api.patch(`/admin/courses/${editingCourse.id}/`, payload);
                toast.success('Course updated');
            } else {
                await api.post('/admin/courses/', payload);
                toast.success('Course created');
            }
            setShowModal(false);
            fetchCourses();
        } catch (error) {
            console.error(error);
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete all lessons in this course.")) return;
        try {
            await api.delete(`/admin/courses/${id}/`);
            toast.success("Course deleted");
            fetchCourses();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading courses...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Course Management</h1>
                    <p className="text-slate-400">Manage courses and their content</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-lg shadow-green-900/20"
                >
                    <Plus size={20} /> New Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg hover:border-green-500/50 transition-all group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-green-500/10 text-green-400 p-3 rounded-lg">
                                    <BookOpen size={24} />
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${course.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                    {course.is_active ? 'Active' : 'Draft'}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description || 'No description'}</p>

                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                <div className="flex items-center gap-1.5">
                                    <Layers size={16} />
                                    <span>{course.lessons_count || 0} Lessons</span>
                                </div>
                                <div>Order: {course.order}</div>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    to={`/admin-panel/courses/${course.id}`}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    Manage Content <ArrowRight size={16} />
                                </Link>
                                <button
                                    onClick={() => handleOpenModal(course)}
                                    className="p-2 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors border border-slate-700 hover:border-slate-500"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(course.id)}
                                    className="p-2 hover:bg-slate-700 rounded-lg text-red-400 transition-colors border border-slate-700 hover:border-slate-500"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl w-full max-w-lg border border-slate-700 shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">
                                {editingCourse ? 'Edit Course' : 'New Course'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Order</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.order}
                                            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                                        />
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="isActiveCourse"
                                                checked={formData.is_active}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-green-600 focus:ring-green-500"
                                            />
                                            <label htmlFor="isActiveCourse" className="text-sm font-medium text-slate-400">Active</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-6 shadow-lg shadow-green-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> Save Course
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManagement;
