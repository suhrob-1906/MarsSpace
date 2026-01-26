import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, BookOpen, ShoppingBag, FileText, Plus, Trash2, Edit, Download, CheckCircle, XCircle, X, Save, Upload } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, courses: 0, orders: 0, homework: 0 });
    const [activeTab, setActiveTab] = useState('homework'); // homework, users, courses, shop

    // Homework Management
    const [homeworkSubmissions, setHomeworkSubmissions] = useState([]);
    const [homeworkLoading, setHomeworkLoading] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [coinsReward, setCoinsReward] = useState(0);
    const [teacherComment, setTeacherComment] = useState('');

    // Shop Management
    const [shopItems, setShopItems] = useState([]);
    const [shopLoading, setShopLoading] = useState(false);
    const [showShopModal, setShowShopModal] = useState(false);
    const [editingShopItem, setEditingShopItem] = useState(null);
    const [shopForm, setShopForm] = useState({
        title: '',
        description: '',
        image_url: '',
        price_coins: 0,
        stock: 999,
        category: 'General',
        is_active: true
    });

    // Course Management
    const [courses, setCourses] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);
    const [courseForm, setCourseForm] = useState({ title: '', description: '', order: 0, is_active: true });
    const [lessonForm, setLessonForm] = useState({
        course: '',
        index: 1,
        title: '',
        theory_text: '',
        practice_text: '',
        lesson_type: 'NORMAL',
        is_active: true
    });

    // Users
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    useEffect(() => {
        fetchStats();
        if (activeTab === 'homework') {
            fetchHomework();
        } else if (activeTab === 'shop') {
            fetchShopItems();
        } else if (activeTab === 'courses') {
            fetchCourses();
        } else if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const [usersRes, coursesRes, shopRes, homeworkRes] = await Promise.all([
                api.get('/users/'),
                api.get('/admin/courses/'),
                api.get('/admin/shop/items/'),
                api.get('/admin/homework/')
            ]);
            setStats({
                users: usersRes.data.length || 0,
                courses: coursesRes.data.length || 0,
                orders: 0, // Can be calculated from orders
                homework: homeworkRes.data.length || 0
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const fetchHomework = async () => {
        setHomeworkLoading(true);
        try {
            const res = await api.get('/admin/homework/');
            setHomeworkSubmissions(res.data);
        } catch (err) {
            console.error('Failed to fetch homework:', err);
        } finally {
            setHomeworkLoading(false);
        }
    };

    const fetchShopItems = async () => {
        setShopLoading(true);
        try {
            const res = await api.get('/admin/shop/items/');
            setShopItems(res.data);
        } catch (err) {
            console.error('Failed to fetch shop items:', err);
        } finally {
            setShopLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses/');
            setCourses(res.data);
            if (res.data.length > 0) {
                fetchLessons(res.data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        }
    };

    const fetchLessons = async (courseId) => {
        try {
            const res = await api.get(`/admin/courses/${courseId}/`);
            setLessons(res.data.lessons || []);
        } catch (err) {
            console.error('Failed to fetch lessons:', err);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await api.get('/users/');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleAcceptHomework = async (submission) => {
        try {
            await api.post(`/admin/homework/${submission.id}/accept/`, {
                coins_reward: coinsReward || submission.coins_reward || 0,
                teacher_comment: teacherComment
            });
            alert('Homework accepted! Coins awarded.');
            setSelectedSubmission(null);
            setCoinsReward(0);
            setTeacherComment('');
            fetchHomework();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to accept homework');
        }
    };

    const handleRejectHomework = async (submission) => {
        if (!confirm('Reject this homework submission?')) return;
        try {
            await api.post(`/admin/homework/${submission.id}/reject/`, {
                teacher_comment: teacherComment
            });
            alert('Homework rejected.');
            setSelectedSubmission(null);
            setTeacherComment('');
            fetchHomework();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to reject homework');
        }
    };

    const handleDownloadHomework = (submission) => {
        if (submission.file_url) {
            window.open(submission.file_url, '_blank');
        } else {
            alert('File URL not available');
        }
    };

    const handleSaveShopItem = async () => {
        try {
            if (editingShopItem) {
                await api.put(`/admin/shop/items/${editingShopItem.id}/`, shopForm);
            } else {
                await api.post('/admin/shop/items/', shopForm);
            }
            setShowShopModal(false);
            setEditingShopItem(null);
            setShopForm({
                title: '', description: '', image_url: '', price_coins: 0,
                stock: 999, category: 'General', is_active: true
            });
            fetchShopItems();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to save shop item');
        }
    };

    const handleDeleteShopItem = async (id) => {
        if (!confirm('Delete this shop item?')) return;
        try {
            await api.delete(`/admin/shop/items/${id}/`);
            fetchShopItems();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to delete shop item');
        }
    };

    const handleEditShopItem = (item) => {
        setEditingShopItem(item);
        setShopForm({
            title: item.title,
            description: item.description || '',
            image_url: item.image_url || '',
            price_coins: item.price_coins,
            stock: item.stock,
            category: item.category,
            is_active: item.is_active
        });
        setShowShopModal(true);
    };

    const handleSaveCourse = async () => {
        try {
            if (editingCourse) {
                await api.put(`/admin/courses/${editingCourse.id}/`, courseForm);
            } else {
                await api.post('/admin/courses/', courseForm);
            }
            setShowCourseModal(false);
            setEditingCourse(null);
            setCourseForm({ title: '', description: '', order: 0, is_active: true });
            fetchCourses();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to save course');
        }
    };

    const handleSaveLesson = async () => {
        try {
            if (editingLesson) {
                await api.put(`/admin/lessons/${editingLesson.id}/`, lessonForm);
            } else {
                await api.post('/admin/lessons/', lessonForm);
            }
            setShowLessonModal(false);
            setEditingLesson(null);
            setLessonForm({
                course: '', index: 1, title: '', theory_text: '', practice_text: '',
                lesson_type: 'NORMAL', is_active: true
            });
            fetchCourses();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to save lesson');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Admin Panel</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.users}</div>
                        <div className="text-sm text-slate-400">Total Users</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.courses}</div>
                        <div className="text-sm text-slate-400">Active Courses</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{shopItems.length}</div>
                        <div className="text-sm text-slate-400">Shop Items</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                        <FileText size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.homework}</div>
                        <div className="text-sm text-slate-400">Homework Submissions</div>
                    </div>
                </div>
            </div>

            {/* Management Tabs */}
            <div className="bg-surface rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="flex border-b border-slate-700/50 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('homework')}
                        className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'homework' ? 'bg-slate-800 text-white border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                    >
                        <FileText size={18} className="inline mr-2" />
                        Homework Management
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-slate-800 text-white border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Users size={18} className="inline mr-2" />
                        Users Management
                    </button>
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'courses' ? 'bg-slate-800 text-white border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                    >
                        <BookOpen size={18} className="inline mr-2" />
                        Courses & Lessons
                    </button>
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'shop' ? 'bg-slate-800 text-white border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ShoppingBag size={18} className="inline mr-2" />
                        Shop Items
                    </button>
                </div>

                <div className="p-6">
                    {/* Homework Management */}
                    {activeTab === 'homework' && (
                        <div>
                            <div className="flex justify-between mb-4">
                                <h3 className="font-bold text-white">Homework Submissions</h3>
                                <div className="flex gap-2">
                                    <select
                                        className="input text-sm"
                                        onChange={(e) => {
                                            const filtered = homeworkSubmissions.filter(h => 
                                                e.target.value === 'all' || h.status === e.target.value
                                            );
                                            // This is just for display, we should refetch
                                        }}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="SUBMITTED">Submitted</option>
                                        <option value="ACCEPTED">Accepted</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            {homeworkLoading ? (
                                <div className="text-center py-10 text-slate-500">Loading...</div>
                            ) : (
                                <div className="space-y-3">
                                    {homeworkSubmissions.map((sub) => (
                                        <div key={sub.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-primary/30 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-white">{sub.student_username}</div>
                                                        <div className="text-sm text-slate-400">
                                                            {sub.course_title} • {sub.lesson_title}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            Submitted: {new Date(sub.created_at).toLocaleString()}
                                                        </div>
                                                        {sub.reviewed_at && (
                                                            <div className="text-xs text-slate-500">
                                                                Reviewed: {new Date(sub.reviewed_at).toLocaleString()} by {sub.reviewed_by_username}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className={`px-3 py-1 rounded text-xs font-bold ${
                                                        sub.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                                        sub.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                        sub.status === 'VIEWED' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {sub.status}
                                                    </div>
                                                    {sub.coins_reward > 0 && (
                                                        <div className="text-amber-500 font-bold text-sm">
                                                            {sub.coins_reward} 🪙
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDownloadHomework(sub)}
                                                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                                                            title="Download ZIP"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                        {sub.status === 'SUBMITTED' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedSubmission(sub);
                                                                        setCoinsReward(sub.coins_reward || 0);
                                                                        setTeacherComment(sub.teacher_comment || '');
                                                                    }}
                                                                    className="p-2 hover:bg-green-500/20 rounded-lg text-slate-400 hover:text-green-400"
                                                                    title="Review"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAcceptHomework(sub)}
                                                                    className="p-2 hover:bg-green-500/20 rounded-lg text-slate-400 hover:text-green-400"
                                                                    title="Accept"
                                                                >
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedSubmission(sub);
                                                                        setTeacherComment('');
                                                                    }}
                                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {homeworkSubmissions.length === 0 && (
                                        <div className="text-center py-10 text-slate-500">No homework submissions</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Users Management */}
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex justify-between mb-4">
                                <h3 className="font-bold text-white">Users Directory</h3>
                            </div>
                            {usersLoading ? (
                                <div className="text-center py-10 text-slate-500">Loading...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-slate-500 text-sm border-b border-slate-700">
                                            <tr>
                                                <th className="pb-3 pl-2">Username</th>
                                                <th className="pb-3">Name</th>
                                                <th className="pb-3">Role</th>
                                                <th className="pb-3">Balance</th>
                                                <th className="pb-3">Energy</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-slate-300">
                                            {users.map(u => (
                                                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                                    <td className="py-3 pl-2 font-medium text-white">{u.username}</td>
                                                    <td className="py-3">
                                                        {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : '-'}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            u.role === 'ADMIN' ? 'bg-red-500/20 text-red-300' :
                                                            u.role === 'TEACHER' ? 'bg-blue-500/20 text-blue-300' :
                                                            'bg-green-500/20 text-green-300'
                                                        }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 font-mono text-amber-500">
                                                        {u.wallet?.coins || 0} 🪙
                                                    </td>
                                                    <td className="py-3 font-mono text-green-500">
                                                        {u.wallet?.energy || 0} ⚡
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Courses Management */}
                    {activeTab === 'courses' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-white">Courses & Lessons</h3>
                                <button
                                    onClick={() => {
                                        setEditingCourse(null);
                                        setCourseForm({ title: '', description: '', order: 0, is_active: true });
                                        setShowCourseModal(true);
                                    }}
                                    className="btn btn-primary text-sm"
                                >
                                    <Plus size={16} /> Add Course
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courses.map(course => (
                                    <div key={course.id} className="card">
                                        <h4 className="font-bold text-white mb-2">{course.title}</h4>
                                        <p className="text-sm text-slate-400 mb-4">{course.description}</p>
                                        <button
                                            onClick={() => {
                                                fetchLessons(course.id);
                                                setEditingCourse(course);
                                                setCourseForm(course);
                                                setShowCourseModal(true);
                                            }}
                                            className="btn btn-secondary text-sm w-full mb-2"
                                        >
                                            <Edit size={16} /> Edit Course
                                        </button>
                                        <button
                                            onClick={() => {
                                                setLessonForm({
                                                    course: course.id,
                                                    index: (lessons.length || 0) + 1,
                                                    title: '',
                                                    theory_text: '',
                                                    practice_text: '',
                                                    lesson_type: 'NORMAL',
                                                    is_active: true
                                                });
                                                setEditingLesson(null);
                                                setShowLessonModal(true);
                                            }}
                                            className="btn btn-primary text-sm w-full"
                                        >
                                            <Plus size={16} /> Add Lesson
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shop Management */}
                    {activeTab === 'shop' && (
                        <div>
                            <div className="flex justify-between mb-4">
                                <h3 className="font-bold text-white">Shop Items</h3>
                                <button
                                    onClick={() => {
                                        setEditingShopItem(null);
                                        setShopForm({
                                            title: '', description: '', image_url: '', price_coins: 0,
                                            stock: 999, category: 'General', is_active: true
                                        });
                                        setShowShopModal(true);
                                    }}
                                    className="btn btn-primary text-sm"
                                >
                                    <Plus size={16} /> Add Item
                                </button>
                            </div>
                            {shopLoading ? (
                                <div className="text-center py-10 text-slate-500">Loading...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {shopItems.map(item => (
                                        <div key={item.id} className="card">
                                            {item.image_url && (
                                                <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover rounded-xl mb-3" />
                                            )}
                                            <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.description}</p>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="text-amber-500 font-bold">{item.price_coins} 🪙</div>
                                                <div className="text-xs text-slate-500">Stock: {item.stock}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditShopItem(item)}
                                                    className="btn btn-secondary flex-1 text-sm"
                                                >
                                                    <Edit size={16} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteShopItem(item.id)}
                                                    className="btn btn-outline text-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Homework Review Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Review Homework</h3>
                            <button
                                onClick={() => {
                                    setSelectedSubmission(null);
                                    setCoinsReward(0);
                                    setTeacherComment('');
                                }}
                                className="text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Student</label>
                                <div className="text-white font-medium">{selectedSubmission.student_username}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Course & Lesson</label>
                                <div className="text-white">{selectedSubmission.course_title} • {selectedSubmission.lesson_title}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Coins Reward</label>
                                <input
                                    type="number"
                                    value={coinsReward}
                                    onChange={(e) => setCoinsReward(parseInt(e.target.value) || 0)}
                                    className="input w-full"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Comment</label>
                                <textarea
                                    value={teacherComment}
                                    onChange={(e) => setTeacherComment(e.target.value)}
                                    className="input w-full h-24 resize-none"
                                    placeholder="Add feedback..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAcceptHomework(selectedSubmission)}
                                    className="btn btn-primary flex-1"
                                >
                                    <CheckCircle size={18} /> Accept & Award Coins
                                </button>
                                <button
                                    onClick={() => handleRejectHomework(selectedSubmission)}
                                    className="btn btn-secondary flex-1"
                                >
                                    <XCircle size={18} /> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shop Item Modal */}
            {showShopModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">
                                {editingShopItem ? 'Edit Shop Item' : 'Add Shop Item'}
                            </h3>
                            <button onClick={() => setShowShopModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={shopForm.title}
                                    onChange={(e) => setShopForm({ ...shopForm, title: e.target.value })}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Description</label>
                                <textarea
                                    value={shopForm.description}
                                    onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                                    className="input w-full h-24 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Image URL</label>
                                <input
                                    type="url"
                                    value={shopForm.image_url}
                                    onChange={(e) => setShopForm({ ...shopForm, image_url: e.target.value })}
                                    className="input w-full"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Price (Coins)</label>
                                    <input
                                        type="number"
                                        value={shopForm.price_coins}
                                        onChange={(e) => setShopForm({ ...shopForm, price_coins: parseInt(e.target.value) || 0 })}
                                        className="input w-full"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Stock</label>
                                    <input
                                        type="number"
                                        value={shopForm.stock}
                                        onChange={(e) => setShopForm({ ...shopForm, stock: parseInt(e.target.value) || 0 })}
                                        className="input w-full"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Category</label>
                                <input
                                    type="text"
                                    value={shopForm.category}
                                    onChange={(e) => setShopForm({ ...shopForm, category: e.target.value })}
                                    className="input w-full"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={shopForm.is_active}
                                    onChange={(e) => setShopForm({ ...shopForm, is_active: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label className="text-sm text-slate-400">Active</label>
                            </div>
                            <button onClick={handleSaveShopItem} className="btn btn-primary w-full">
                                <Save size={18} /> Save Item
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Course Modal */}
            {showCourseModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">
                                {editingCourse ? 'Edit Course' : 'Add Course'}
                            </h3>
                            <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={courseForm.title}
                                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Description</label>
                                <textarea
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    className="input w-full h-24 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Order</label>
                                <input
                                    type="number"
                                    value={courseForm.order}
                                    onChange={(e) => setCourseForm({ ...courseForm, order: parseInt(e.target.value) || 0 })}
                                    className="input w-full"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={courseForm.is_active}
                                    onChange={(e) => setCourseForm({ ...courseForm, is_active: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label className="text-sm text-slate-400">Active</label>
                            </div>
                            <button onClick={handleSaveCourse} className="btn btn-primary w-full">
                                <Save size={18} /> Save Course
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lesson Modal */}
            {showLessonModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-4xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">
                                {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
                            </h3>
                            <button onClick={() => setShowLessonModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Course</label>
                                    <select
                                        value={lessonForm.course}
                                        onChange={(e) => setLessonForm({ ...lessonForm, course: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Index</label>
                                    <input
                                        type="number"
                                        value={lessonForm.index}
                                        onChange={(e) => setLessonForm({ ...lessonForm, index: parseInt(e.target.value) || 1 })}
                                        className="input w-full"
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Theory Text</label>
                                <textarea
                                    value={lessonForm.theory_text}
                                    onChange={(e) => setLessonForm({ ...lessonForm, theory_text: e.target.value })}
                                    className="input w-full h-32 resize-none font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Practice Text</label>
                                <textarea
                                    value={lessonForm.practice_text}
                                    onChange={(e) => setLessonForm({ ...lessonForm, practice_text: e.target.value })}
                                    className="input w-full h-32 resize-none font-mono text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Type</label>
                                    <select
                                        value={lessonForm.lesson_type}
                                        onChange={(e) => setLessonForm({ ...lessonForm, lesson_type: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="NORMAL">Normal</option>
                                        <option value="EXAM">Exam</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        type="checkbox"
                                        checked={lessonForm.is_active}
                                        onChange={(e) => setLessonForm({ ...lessonForm, is_active: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label className="text-sm text-slate-400">Active</label>
                                </div>
                            </div>
                            <button onClick={handleSaveLesson} className="btn btn-primary w-full">
                                <Save size={18} /> Save Lesson
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
