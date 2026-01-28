import { useState, useEffect } from 'react';
import { Video, FolderOpen, BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';

const EduverseManagement = () => {
    const [activeTab, setActiveTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [videos, setVideos] = useState([]);
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            switch (activeTab) {
                case 'categories': {
                    const catResponse = await api.get('/admin/eduverse/categories/');
                    setCategories(catResponse.data);
                    break;
                }
                case 'videos': {
                    const vidResponse = await api.get('/admin/eduverse/videos/');
                    setVideos(vidResponse.data);
                    break;
                }
                case 'homework': {
                    const hwResponse = await api.get('/admin/eduverse/homework/');
                    setHomework(hwResponse.data);
                    break;
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const endpoint = {
                categories: '/admin/eduverse/categories/',
                videos: '/admin/eduverse/videos/',
                homework: '/admin/eduverse/homework/',
            }[activeTab];

            await api.post(endpoint, formData);
            setShowModal(false);
            setFormData({});
            fetchData();
        } catch (error) {
            console.error('Failed to create:', error);
            alert('Failed to create item');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const endpoint = {
                categories: `/admin/eduverse/categories/${selectedItem.slug || selectedItem.id}/`,
                videos: `/admin/eduverse/videos/${selectedItem.id}/`,
                homework: `/admin/eduverse/homework/${selectedItem.id}/`,
            }[activeTab];

            await api.put(endpoint, formData);
            setShowModal(false);
            setSelectedItem(null);
            setFormData({});
            fetchData();
        } catch (error) {
            console.error('Failed to update:', error);
            alert('Failed to update item');
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const endpoint = {
                categories: `/admin/eduverse/categories/${item.slug || item.id}/`,
                videos: `/admin/eduverse/videos/${item.id}/`,
                homework: `/admin/eduverse/homework/${item.id}/`,
            }[activeTab];

            await api.delete(endpoint);
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Failed to delete item');
        }
    };

    const openCreateModal = () => {
        setModalType('create');
        setSelectedItem(null);
        setFormData(getDefaultFormData());
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setModalType('edit');
        setSelectedItem(item);
        setFormData(item);
        setShowModal(true);
    };

    const getDefaultFormData = () => {
        switch (activeTab) {
            case 'categories':
                return { title: '', slug: '' };
            case 'videos':
                return { category: '', title: '', banner_url: '', video_url: '' };
            case 'homework':
                return { title: '', description: '', course_category: '', due_date: '', max_points: 100, is_active: true };
            default:
                return {};
        }
    };

    const tabs = [
        { id: 'categories', label: 'Categories', icon: FolderOpen },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'homework', label: 'Current Tasks', icon: BookOpen },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Video className="text-gray-400" size={28} />
                        Eduverse Management
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Manage content and tasks</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                    <Plus size={18} />
                    Create {activeTab === 'homework' ? 'Task' : activeTab === 'categories' ? 'Category' : 'Video'}
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-700">
                <div className="flex gap-6">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                    ? 'border-white text-white'
                                    : 'border-transparent text-slate-400 hover:text-white'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="bg-slate-900 rounded-lg border border-slate-800">
                {loading ? (
                    <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
                ) : (
                    <>
                        {/* Categories */}
                        {activeTab === 'categories' && (
                            <div className="divide-y divide-slate-800">
                                {categories.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">No categories found</div>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                            <div>
                                                <div className="font-medium text-white">{cat.title}</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    Slug: {cat.slug} • {cat.videos?.length || 0} videos
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditModal(cat)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(cat)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300 hover:text-red-400">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Videos */}
                        {activeTab === 'videos' && (
                            <div className="divide-y divide-slate-800">
                                {videos.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">No videos found</div>
                                ) : (
                                    videos.map(video => (
                                        <div key={video.id} className="p-4 flex items-start gap-4 hover:bg-slate-800/50 transition-colors">
                                            {video.banner_url && (
                                                <img src={video.banner_url} alt="" className="w-24 h-16 object-cover rounded bg-slate-800" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-white truncate">{video.title}</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    Category: {video.category}
                                                </div>
                                                <div className="text-xs text-slate-600 truncate mt-0.5">{video.video_url}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditModal(video)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(video)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300 hover:text-red-400">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Homework (Current Tasks) */}
                        {activeTab === 'homework' && (
                            <div className="divide-y divide-slate-800">
                                {homework.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">No tasks found</div>
                                ) : (
                                    homework.map(hw => (
                                        <div key={hw.id} className="p-4 flex items-start gap-4 hover:bg-slate-800/50 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white">{hw.title}</span>
                                                    {!hw.is_active && (
                                                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Inactive</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-400 mt-1 line-clamp-2">{hw.description}</div>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                                                    <span>Category: {hw.category_name}</span>
                                                    <span>Points: {hw.max_points}</span>
                                                    <span>Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                                                    <span>Subs: {hw.submissions_count}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditModal(hw)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(hw)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300 hover:text-red-400">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Simplified Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-6">
                            {modalType === 'create' ? 'Create' : 'Edit'} {activeTab === 'homework' ? 'Task' : activeTab === 'categories' ? 'Category' : 'Video'}
                        </h2>
                        <form onSubmit={modalType === 'create' ? handleCreate : handleUpdate} className="space-y-4">
                            {activeTab === 'categories' && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Slug</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.slug || ''}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'videos' && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Category ID</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.category || ''}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value ? parseInt(e.target.value) : '' })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Banner URL</label>
                                        <input
                                            type="url"
                                            value={formData.banner_url || ''}
                                            onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Video URL</label>
                                        <input
                                            type="url"
                                            required
                                            value={formData.video_url || ''}
                                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'homework' && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Description</label>
                                        <textarea
                                            required
                                            rows="3"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">Category ID</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.course_category || ''}
                                                onChange={(e) => setFormData({ ...formData, course_category: e.target.value ? parseInt(e.target.value) : '' })}
                                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400">Max Points</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={formData.max_points || 100}
                                                onChange={(e) => setFormData({ ...formData, max_points: e.target.value ? parseInt(e.target.value) : 100 })}
                                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Due Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.due_date || ''}
                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active || false}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-white focus:ring-offset-0 focus:ring-0"
                                        />
                                        <label htmlFor="is_active" className="text-sm text-slate-300">Active</label>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                                >
                                    {modalType === 'create' ? 'Create' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EduverseManagement;
