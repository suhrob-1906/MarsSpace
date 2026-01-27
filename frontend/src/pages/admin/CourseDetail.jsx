import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    ArrowLeft,
    FileText,
    Code,
    FileBox
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        index: 1,
        theory_text: '',
        practice_text: '',
        lesson_type: 'NORMAL',
        is_active: true
    });

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            const [courseRes, lessonsRes] = await Promise.all([
                api.get(`/admin/courses/${courseId}/`),
                api.get('/admin/lessons/', { params: { course: courseId } }) // Check backend filter support
            ]);
            setCourse(courseRes.data);

            // If backend doesn't filter perfectly, client side filter (though inefficient for large datasets)
            // Ideally backend supports ?course=ID
            // Assuming AdminLessonViewSet doesn't have specific filter backend configured, let's filter manually if needed
            // But usually DRF needs DjangoFilterBackend. 
            // If API returns all lessons, we valid.
            const allLessons = lessonsRes.data.results || lessonsRes.data;
            const courseLessons = allLessons.filter(l => l.course === parseInt(courseId));
            setLessons(courseLessons.sort((a, b) => a.index - b.index));

        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load course data");
            navigate('/admin-panel/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (lesson = null) => {
        if (lesson) {
            setEditingLesson(lesson);
            setFormData({
                title: lesson.title,
                index: lesson.index,
                theory_text: lesson.theory_text || '',
                practice_text: lesson.practice_text || '',
                lesson_type: lesson.lesson_type || 'NORMAL',
                is_active: lesson.is_active
            });
        } else {
            setEditingLesson(null);
            setFormData({
                title: '',
                index: lessons.length + 1,
                theory_text: '',
                practice_text: '',
                lesson_type: 'NORMAL',
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
                course: parseInt(courseId)
            };

            if (editingLesson) {
                await api.patch(`/admin/lessons/${editingLesson.id}/`, payload);
                toast.success('Lesson updated');
            } else {
                await api.post('/admin/lessons/', payload);
                toast.success('Lesson created');
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
            await api.delete(`/admin/lessons/${id}/`);
            toast.success("Lesson deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading lesson data...</div>;
    if (!course) return null;

    return (
        <div className="max-w-6xl mx-auto">
            <button
                onClick={() => navigate('/admin-panel/courses')}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} /> Back to Courses
            </button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                    <p className="text-slate-400 max-w-2xl">{course.description}</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-lg shadow-green-900/20"
                >
                    <Plus size={20} /> Add Lesson
                </button>
            </div>

            <div className="space-y-4">
                {lessons.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
                        <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No Lessons Yet</h3>
                        <p className="text-slate-400">Start adding content to this course</p>
                    </div>
                ) : (
                    lessons.map((lesson) => (
                        <div key={lesson.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex items-center justify-between hover:border-slate-500 transition-colors group">
                            <div className="flex items-center gap-6">
                                <div className="bg-slate-700 w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-slate-400">
                                    {lesson.index}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded ${lesson.lesson_type === 'EXAM'
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {lesson.lesson_type}
                                        </span>
                                        {!lesson.is_active && (
                                            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">Draft</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        {lesson.theory_text && (
                                            <div className="flex items-center gap-1">
                                                <FileText size={14} /> Theory
                                            </div>
                                        )}
                                        {lesson.practice_text && (
                                            <div className="flex items-center gap-1">
                                                <Code size={14} /> Practice
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(lesson)}
                                    className="p-2 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(lesson.id)}
                                    className="p-2 hover:bg-slate-700 rounded-lg text-red-400 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl w-full max-w-4xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">
                                {editingLesson ? 'Edit Lesson' : 'New Lesson'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Index</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.index}
                                                onChange={e => setFormData({ ...formData, index: parseInt(e.target.value) })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                                            <select
                                                value={formData.lesson_type}
                                                onChange={e => setFormData({ ...formData, lesson_type: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                                            >
                                                <option value="NORMAL">Normal</option>
                                                <option value="EXAM">Exam</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="isActiveLesson"
                                            checked={formData.is_active}
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-green-600 focus:ring-green-500"
                                        />
                                        <label htmlFor="isActiveLesson" className="text-sm font-medium text-slate-400">Lesson is Active</label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="block text-sm font-medium text-slate-400">Theory Content (Markdown)</label>
                                            <span className="text-xs text-slate-500">Supports Markdown</span>
                                        </div>
                                        <textarea
                                            value={formData.theory_text}
                                            onChange={e => setFormData({ ...formData, theory_text: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 h-40 font-mono text-sm"
                                            placeholder="# Lesson Title..."
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="block text-sm font-medium text-slate-400">Practice Content (Markdown)</label>
                                        </div>
                                        <textarea
                                            value={formData.practice_text}
                                            onChange={e => setFormData({ ...formData, practice_text: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 h-40 font-mono text-sm"
                                            placeholder="## Task 1..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> Save Lesson
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;
