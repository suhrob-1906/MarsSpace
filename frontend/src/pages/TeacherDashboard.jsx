import { Folder, Download, CheckCircle, XCircle } from 'lucide-react';

const TeacherDashboard = () => {
    // Mock submissions
    const submissions = [
        { id: 1, student: 'student1', lesson: 'Loops & Conditions', file: 'homework_1.zip', status: 'SUBMITTED', date: '2023-10-25' },
        { id: 2, student: 'student2', lesson: 'Variables', file: 'homework_2.zip', status: 'ACCEPTED', date: '2023-10-24' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">Teacher Panel</h1>
            <p className="text-slate-400">Review homework submissions from your groups.</p>

            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white">Recent Submissions</h3>
                    <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
                        <option>All Groups</option>
                        <option>Jedi Padawans</option>
                    </select>
                </div>

                <div className="space-y-4">
                    {submissions.map((sub) => (
                        <div key={sub.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Folder size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-white">{sub.student}</div>
                                    <div className="text-sm text-slate-400">{sub.lesson} • {sub.date}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`px-3 py-1 rounded text-xs font-bold ${sub.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                        sub.status === 'SUBMITTED' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-slate-700 text-slate-400'
                                    }`}>
                                    {sub.status}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white" title="Download">
                                        <Download size={18} />
                                    </button>
                                    <div className="w-px h-6 bg-slate-700 mx-2"></div>
                                    <button className="p-2 hover:bg-green-500/20 rounded-lg text-slate-400 hover:text-green-400" title="Accept">
                                        <CheckCircle size={18} />
                                    </button>
                                    <button className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400" title="Reject">
                                        <XCircle size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default TeacherDashboard;
