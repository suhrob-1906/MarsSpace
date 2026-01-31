import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, AlertCircle, Upload, X, FileText } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const CurrentTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Submission Modal State
    const [selectedTask, setSelectedTask] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, subsRes] = await Promise.all([
                api.get('/homework/'),
                api.get('/homework-submissions/') // This endpoint handles filtering by user automatically
            ]);

            // Handle pagination
            const tasksData = tasksRes.data.results || tasksRes.data;
            setTasks(Array.isArray(tasksData) ? tasksData : []);

            const subsData = subsRes.data.results || subsRes.data;
            setSubmissions(Array.isArray(subsData) ? subsData : []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const getSubmissionStatus = (taskId) => {
        const sub = submissions.find(s => s.homework === taskId);
        if (!sub) return 'pending';
        if (sub.graded_at) return 'graded';
        return 'submitted';
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    const handleOpenSubmit = (task) => {
        setSelectedTask(task);
        setSubmissionText('');
        setSubmissionFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionText && !submissionFile) {
            toast.error('Please add text or upload a file');
            return;
        }

        // Check file size (50MB limit)
        if (submissionFile && submissionFile.size > 50 * 1024 * 1024) {
            toast.error('File size must be less than 50MB');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('homework', selectedTask.id);

        // Ensure content is not empty string to prevent validation error
        const contentToSend = submissionText.trim() === '' ? 'File Submission' : submissionText;
        formData.append('content', contentToSend);

        if (submissionFile) {
            formData.append('file_url', submissionFile);
        }

        try {
            await api.post('/homework-submissions/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Homework submitted successfully! 🚀');
            setSelectedTask(null);
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Submission failed:', error);
            const errorMsg = error.response?.data?.error
                || error.response?.data?.detail
                || 'Failed to submit homework';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <BookOpen className="text-emerald-500" />
                    Current Tasks
                </h1>
                <p className="text-slate-400 mt-2">Manage your assignments and track your progress.</p>
            </header>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading tasks...</div>
            ) : (
                <div className="space-y-6">
                    {tasks.length === 0 ? (
                        <div className="bg-slate-800/30 rounded-2xl p-12 text-center border border-slate-700/50">
                            <CheckCircle size={64} className="mx-auto text-emerald-500/20 mb-4" />
                            <h3 className="text-xl font-semibold text-white">All caught up!</h3>
                            <p className="text-slate-400 mt-2">You don't have any active tasks right now.</p>
                        </div>
                    ) : (
                        tasks.map(task => {
                            const status = getSubmissionStatus(task.id);
                            const overdue = isOverdue(task.due_date);
                            const submission = submissions.find(s => s.homework === task.id);

                            return (
                                <div key={task.id} className="bg-slate-800 rounded-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                                                {status === 'graded' && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                                                        Graded: {submission.points_earned}/{task.max_points}
                                                    </span>
                                                )}
                                                {status === 'submitted' && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                        Submitted
                                                    </span>
                                                )}
                                                {status === 'pending' && overdue && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                                        Overdue
                                                    </span>
                                                )}
                                                {status === 'pending' && !overdue && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-600/50 text-slate-300 border border-slate-600">
                                                        To Do
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-slate-300 mb-4 leading-relaxed">{task.description}</p>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                                                <div>Max Points: {task.max_points}</div>
                                            </div>

                                            {submission?.feedback && (
                                                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border-l-2 border-primary">
                                                    <div className="text-xs font-semibold text-primary mb-1">Teacher Feedback</div>
                                                    <p className="text-slate-300 text-sm italic">"{submission.feedback}"</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            {status === 'pending' && (
                                                <button
                                                    onClick={() => handleOpenSubmit(task)}
                                                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
                                                >
                                                    <Upload size={16} /> Submit Task
                                                </button>
                                            )}
                                            {status !== 'pending' && (
                                                <button className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors text-sm cursor-default">
                                                    View Submission
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Submit Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTask(null)}>
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-slate-700" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Submit Homework</h3>
                            <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Your Answer</label>
                                <textarea
                                    value={submissionText}
                                    onChange={e => setSubmissionText(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Type your answer here..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Attach File (Optional)</label>
                                <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-slate-500 transition-colors cursor-pointer bg-slate-900/50 relative">
                                    <input
                                        type="file"
                                        accept=".zip,.pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={e => setSubmissionFile(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <FileText size={24} />
                                        <span className="text-sm">
                                            {submissionFile ? submissionFile.name : "Click to upload file (ZIP, PDF, images)"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Homework'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrentTasks;
