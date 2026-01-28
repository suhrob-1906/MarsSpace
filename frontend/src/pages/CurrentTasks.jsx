import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';

const CurrentTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, subsRes] = await Promise.all([
                api.get('/homework/'),
                api.get('/homework-submissions/')
            ]);
            setTasks(tasksRes.data);
            setSubmissions(subsRes.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSubmissionStatus = (taskId) => {
        const sub = submissions.find(s => s.homework === taskId);
        if (!sub) return 'pending';
        if (sub.graded_at) return 'graded';
        return 'submitted'; // Submitted but not graded
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
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
                                                    Due: {new Date(task.due_date).toLocaleDateString()} {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                                                <div>Category: {task.category_name}</div>
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
                                                <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors text-sm">
                                                    Submit Task
                                                </button>
                                            )}
                                            {status !== 'pending' && (
                                                <button className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors text-sm">
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
        </div>
    );
};

export default CurrentTasks;
