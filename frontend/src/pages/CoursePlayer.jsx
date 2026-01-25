import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, ArrowRight, FileText } from 'lucide-react';

const CoursePlayer = () => {
    const { id } = useParams(); // Course ID
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const res = await api.get(`/courses/${id}/`);
            setCourse(res.data);
            if (res.data.lessons && res.data.lessons.length > 0) {
                setActiveLesson(res.data.lessons[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        // Here we would call the complete-lesson endpoint we added to views.py
        // For now, let's just simulate the completion visually or implement the call if view exists
        if (!activeLesson) return;

        try {
            await api.post('/my-progress/complete-lesson/', { lesson_id: activeLesson.id });
            alert("Lesson Completed! Progress saved.");

            // Auto advance
            const currentIndex = course.lessons.findIndex(l => l.id === activeLesson.id);
            if (currentIndex < course.lessons.length - 1) {
                setActiveLesson(course.lessons[currentIndex + 1]);
            }
        } catch (err) {
            console.error(err);
            alert("Could not complete lesson or already completed.");
        }
    };

    if (loading) return <div>Loading course...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Sidebar List */}
            <div className="w-80 bg-surface rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
                    <h2 className="font-bold text-white truncate">{course.title}</h2>
                    <div className="text-xs text-slate-400 mt-1">{course.lessons.length} Lessons</div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {course.lessons.map((lesson, idx) => (
                        <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex items-center gap-3 ${activeLesson?.id === lesson.id
                                    ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${activeLesson?.id === lesson.id ? 'border-white text-white' : 'border-slate-600 text-slate-600'}`}>
                                {idx + 1}
                            </div>
                            <span className="truncate">{lesson.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-surface rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden">
                {activeLesson ? (
                    <>
                        <div className="p-8 flex-1 overflow-y-auto">
                            <h1 className="text-3xl font-bold text-white mb-6">{activeLesson.title}</h1>

                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-primary flex items-center gap-2">
                                    <FileText size={20} /> Theory
                                </h3>
                                <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700/50 mb-8 whitespace-pre-line text-slate-300">
                                    {activeLesson.theory_text || "No theory content available."}
                                </div>

                                <h3 className="text-green-400 flex items-center gap-2">
                                    <CheckCircle size={20} /> Practice Task
                                </h3>
                                <div className="p-6 bg-green-900/10 rounded-xl border border-green-500/20 whitespace-pre-line text-slate-300">
                                    {activeLesson.practice_text || "No practice task."}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-700/50 bg-slate-900/30 flex justify-end">
                            <button
                                onClick={handleComplete}
                                className="btn btn-primary px-8"
                            >
                                Complete Lesson <ArrowRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        Select a lesson to start
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursePlayer;
