import { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
import { FileText, Download, CheckCircle, XCircle, Eye, Filter, Search, Calendar } from 'lucide-react';
import api from '../../services/api';

const HomeworkManagement = () => {
    // const { t } = useTranslation();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [coinsReward, setCoinsReward] = useState(10);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/homework/');
            setSubmissions(response.data);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/homework/${selectedSubmission.id}/accept/`, {
                coins_reward: coinsReward,
                teacher_comment: comment,
            });
            setShowAcceptModal(false);
            setSelectedSubmission(null);
            setCoinsReward(10);
            setComment('');
            fetchSubmissions();
        } catch (error) {
            console.error('Failed to accept submission:', error);
            alert(error.response?.data?.detail || 'Failed to accept submission');
        }
    };

    const handleReject = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        try {
            await api.post(`/admin/homework/${selectedSubmission.id}/reject/`, {
                teacher_comment: comment,
            });
            setShowRejectModal(false);
            setSelectedSubmission(null);
            setComment('');
            fetchSubmissions();
        } catch (error) {
            console.error('Failed to reject submission:', error);
            alert(error.response?.data?.detail || 'Failed to reject submission');
        }
    };

    const handleDownload = (submission) => {
        // Create download link
        const fileUrl = submission.file;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `homework_${submission.student_name}_${submission.lesson_title}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesStatus = statusFilter === 'ALL' || submission.status === statusFilter;
        const matchesSearch =
            submission.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.lesson_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status) => {
        const badges = {
            SUBMITTED: 'bg-blue-600 text-white',
            VIEWED: 'bg-yellow-600 text-white',
            ACCEPTED: 'bg-green-600 text-white',
            REJECTED: 'bg-red-600 text-white',
        };
        return badges[status] || 'bg-gray-600 text-white';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ACCEPTED':
                return <CheckCircle size={16} />;
            case 'REJECTED':
                return <XCircle size={16} />;
            case 'VIEWED':
                return <Eye size={16} />;
            default:
                return <FileText size={16} />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="text-red-500" />
                        Homework Management
                    </h1>
                    <p className="text-slate-400 mt-1">Review and grade student homework submissions</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by student, course, or lesson..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="VIEWED">Viewed</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm">Total Submissions</div>
                    <div className="text-2xl font-bold text-white mt-1">{submissions.length}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm">Pending Review</div>
                    <div className="text-2xl font-bold text-blue-400 mt-1">
                        {submissions.filter(s => s.status === 'SUBMITTED').length}
                    </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm">Accepted</div>
                    <div className="text-2xl font-bold text-green-400 mt-1">
                        {submissions.filter(s => s.status === 'ACCEPTED').length}
                    </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm">Rejected</div>
                    <div className="text-2xl font-bold text-red-400 mt-1">
                        {submissions.filter(s => s.status === 'REJECTED').length}
                    </div>
                </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center text-slate-400">
                        Loading submissions...
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center text-slate-400">
                        No submissions found
                    </div>
                ) : (
                    filteredSubmissions.map(submission => (
                        <div
                            key={submission.id}
                            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                            {submission.student_name?.[0]?.toUpperCase() || 'S'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{submission.student_name}</div>
                                            <div className="text-sm text-slate-400">
                                                {submission.course_title} - {submission.lesson_title}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDate(submission.created_at)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(submission.status)}
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(submission.status)}`}>
                                                {submission.status}
                                            </span>
                                        </div>
                                        {submission.coins_reward > 0 && (
                                            <div className="text-yellow-400">
                                                💰 {submission.coins_reward} coins
                                            </div>
                                        )}
                                    </div>

                                    {submission.teacher_comment && (
                                        <div className="mt-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                                            <div className="text-xs text-slate-400 mb-1">Teacher Comment:</div>
                                            <div className="text-sm text-slate-300">{submission.teacher_comment}</div>
                                        </div>
                                    )}

                                    {submission.reviewed_by_name && (
                                        <div className="mt-2 text-xs text-slate-500">
                                            Reviewed by {submission.reviewed_by_name} on {formatDate(submission.reviewed_at)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleDownload(submission)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                    >
                                        <Download size={18} />
                                        Download
                                    </button>

                                    {submission.status === 'SUBMITTED' || submission.status === 'VIEWED' ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedSubmission(submission);
                                                    setCoinsReward(10);
                                                    setComment('');
                                                    setShowAcceptModal(true);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                            >
                                                <CheckCircle size={18} />
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedSubmission(submission);
                                                    setComment('');
                                                    setShowRejectModal(true);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            >
                                                <XCircle size={18} />
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <div className="px-4 py-2 bg-slate-700/50 text-slate-400 rounded-lg text-center text-sm">
                                            {submission.status === 'ACCEPTED' ? 'Already Accepted' : 'Already Rejected'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Accept Modal */}
            {showAcceptModal && selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="text-green-500" />
                            Accept Homework
                        </h2>
                        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-sm text-slate-400">Student:</div>
                            <div className="font-medium text-white">{selectedSubmission.student_name}</div>
                            <div className="text-sm text-slate-400 mt-2">Lesson:</div>
                            <div className="text-sm text-slate-300">{selectedSubmission.lesson_title}</div>
                        </div>
                        <form onSubmit={handleAccept} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Coins Reward *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    value={coinsReward}
                                    onChange={(e) => setCoinsReward(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                />
                                <div className="text-xs text-slate-400 mt-1">
                                    Student will receive {coinsReward} coins
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Comment (Optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows="3"
                                    placeholder="Great work! Keep it up..."
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    Accept & Award Coins
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAcceptModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <XCircle className="text-red-500" />
                            Reject Homework
                        </h2>
                        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-sm text-slate-400">Student:</div>
                            <div className="font-medium text-white">{selectedSubmission.student_name}</div>
                            <div className="text-sm text-slate-400 mt-2">Lesson:</div>
                            <div className="text-sm text-slate-300">{selectedSubmission.lesson_title}</div>
                        </div>
                        <form onSubmit={handleReject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Reason for Rejection *
                                </label>
                                <textarea
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows="4"
                                    placeholder="Please explain why this homework is being rejected..."
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 resize-none"
                                />
                                <div className="text-xs text-slate-400 mt-1">
                                    This comment will be visible to the student
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    Reject Homework
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeworkManagement;
