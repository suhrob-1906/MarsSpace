import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, ArrowRight, FileText, Upload, FileArchive, CheckCircle2, XCircle } from 'lucide-react';

const CoursePlayer = () => {
    const { id } = useParams(); // Course ID
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [homeworkFile, setHomeworkFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [submissions, setSubmissions] = useState({});

    useEffect(() => {
        fetchCourse();
        fetchSubmissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/homework/');
            const submissionsMap = {};
            res.data.forEach(sub => {
                submissionsMap[sub.lesson] = sub;
            });
            setSubmissions(submissionsMap);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
                alert('Please upload a ZIP file only.');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB.');
                return;
            }
            setHomeworkFile(file);
        }
    };

    const handleSubmitHomework = async () => {
        if (!homeworkFile || !activeLesson) {
            alert('Please select a ZIP file to upload.');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', homeworkFile);
            formData.append('lesson', activeLesson.id);

            await api.post('/homework/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Homework submitted successfully!');
            setHomeworkFile(null);
            fetchSubmissions();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to submit homework');
        } finally {
            setUploading(false);
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
                                <div className="p-6 bg-green-900/10 rounded-xl border border-green-500/20 whitespace-pre-line text-slate-300 mb-8">
                                    {activeLesson.practice_text || "No practice task."}
                                </div>

                                {/* Homework Submission Section */}
                                {(activeLesson.lesson_type === 'EXAM' || activeLesson.practice_text) && (
                                    <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                        <h3 className="text-orange-400 flex items-center gap-2 mb-4">
                                            <FileArchive size={20} /> Homework Submission
                                        </h3>
                                        
                                        {submissions[activeLesson.id] ? (
                                            <div className="space-y-3">
                                                <div className={`p-4 rounded-xl border ${
                                                    submissions[activeLesson.id].status === 'ACCEPTED' 
                                                        ? 'bg-green-900/20 border-green-500/50' 
                                                        : submissions[activeLesson.id].status === 'REJECTED'
                                                        ? 'bg-red-900/20 border-red-500/50'
                                                        : 'bg-yellow-900/20 border-yellow-500/50'
                                                }`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-white">
                                                            {submissions[activeLesson.id].status === 'ACCEPTED' && <CheckCircle2 size={18} className="inline mr-2 text-green-400" />}
                                                            {submissions[activeLesson.id].status === 'REJECTED' && <XCircle size={18} className="inline mr-2 text-red-400" />}
                                                            Status: {submissions[activeLesson.id].status}
                                                        </span>
                                                        {submissions[activeLesson.id].coins_reward > 0 && (
                                                            <span className="text-amber-400 font-bold">
                                                                +{submissions[activeLesson.id].coins_reward} 🪙
                                                            </span>
                                                        )}
                                                    </div>
                                                    {submissions[activeLesson.id].teacher_comment && (
                                                        <p className="text-sm text-slate-300 mt-2">
                                                            {submissions[activeLesson.id].teacher_comment}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        Submitted: {new Date(submissions[activeLesson.id].created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-sm text-slate-400 mb-3">
                                                    Upload your homework as a ZIP file (max 10MB)
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <label className="btn btn-secondary cursor-pointer">
                                                        <Upload size={18} /> Choose ZIP File
                                                        <input
                                                            type="file"
                                                            accept=".zip"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    {homeworkFile && (
                                                        <span className="text-sm text-slate-300">
                                                            {homeworkFile.name}
                                                        </span>
                                                    )}
                                                </div>
                                                {homeworkFile && (
                                                    <button
                                                        onClick={handleSubmitHomework}
                                                        disabled={uploading}
                                                        className="btn btn-primary w-full"
                                                    >
                                                        {uploading ? 'Uploading...' : 'Submit Homework'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-700/50 bg-slate-900/30 flex justify-end gap-3">
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
