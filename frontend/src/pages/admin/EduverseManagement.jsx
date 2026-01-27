import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Video, FolderOpen, FileText, BookOpen, Plus, Edit2, Trash2, Search } from 'lucide-react';
import api from '../../services/api';

const EduverseManagement = () => {
    // const { t } = useTranslation(); // Removed unused translation hook
    const [activeTab, setActiveTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [videos, setVideos] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
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
                case 'categories':
                    const catResponse = await api.get('/admin/eduverse/categories/');
                    setCategories(catResponse.data);
                    break;
                case 'videos':
                    const vidResponse = await api.get('/admin/eduverse/videos/');
                    setVideos(vidResponse.data);
                    break;
                case 'blog':
                    const blogResponse = await api.get('/admin/eduverse/blog-posts/');
                    setBlogPosts(blogResponse.data);
                    break;
                case 'homework':
                    const hwResponse = await api.get('/admin/eduverse/homework/');
                    setHomework(hwResponse.data);
                    break;
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
                blog: '/admin/eduverse/blog-posts/',
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
                blog: `/admin/eduverse/blog-posts/${selectedItem.id}/`,
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
                blog: `/admin/eduverse/blog-posts/${item.id}/`,
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
            case 'blog':
                return { post_type: 'TEXT', content: '' };
            case 'homework':
                return { title: '', description: '', course_category: '', due_date: '', max_points: 100, is_active: true };
            default:
                return {};
        }
    };

    const tabs = [
        { id: 'categories', label: 'Categories', icon: FolderOpen },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'blog', label: 'Blog Posts', icon: FileText },
        { id: 'homework', label: 'Homework', icon: BookOpen },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Video className="text-red-500" />
                        Eduverse Management
                    </h1>
                    <p className="text-slate-400 mt-1">Manage educational content and resources</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Create {activeTab === 'categories' ? 'Category' : activeTab === 'videos' ? 'Video' : activeTab === 'blog' ? 'Post' : 'Homework'}
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
                <div className="flex gap-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                    ? 'bg-red-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="bg-slate-800 rounded-lg border border-slate-700">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading...</div>
                ) : (
                    <>
                        {/* Categories */}
                        {activeTab === 'categories' && (
                            <div className="divide-y divide-slate-700">
                                {categories.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">No categories found</div>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-700/50">
                                            <div>
                                                <div className="font-medium text-white">{cat.title}</div>
                                                <div className="text-sm text-slate-400">Slug: {cat.slug}</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {cat.videos?.length || 0} videos
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(cat)}
                                                    className="p-2 hover:bg-slate-600 rounded-lg text-blue-400"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat)}
                                                    className="p-2 hover:bg-slate-600 rounded-lg text-red-400"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Videos */}
                        {activeTab === 'videos' && (
                            <div className="divide-y divide-slate-700">
                                {videos.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">No videos found</div>
                                ) : (
                                    videos.map(video => (
                                        <div key={video.id} className="p-4 flex items-start justify-between hover:bg-slate-700/50">
                                            <div className="flex gap-4">
                                                {video.banner_url && (
                                                    <img
                                                        src={video.banner_url}
                                                        alt={video.title}
                                                        className="w-32 h-20 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium text-white">{video.title}</div>
                                                    <div className="text-sm text-slate-400 mt-1">
                                                        Category ID: {video.category}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {video.video_url}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(video)}
                                                    className="p-2 hover:bg-slate-600 rounded-lg text-blue-400"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(video)}
                                                    className="p-2 hover:bg-slate-600 rounded-lg text-red-400"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Blog Posts */}
                        {activeTab === 'blog' && (
                            <div className="divide-y divide-slate-700">
                                {blogPosts.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">No blog posts found</div>
                                ) : (
                                    blogPosts.map(post => (
                                        <div key={post.id} className="p-4 flex items-start justify-between hover:bg-slate-700/50">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${post.post_type === 'ACHIEVEMENT' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-blue-600/20 text-blue-400'
                                                        }`}>
                                                        {post.post_type}
                                                    </span>
                                                    <span className="text-sm text-slate-400">
                                                        by {post.author_name}
                                                    </span>
                                                </div>
                                                <div className="text-white">{post.content}</div>
                                                <div className="text-xs text-slate-500 mt-2">
                                                    ❤️ {post.like_count} likes • {new Date(post.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => openEditModal(post)}
                                                    className="p-2 hover:bg-slate-600 rounded-lg text-blue-400"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post)}
                                                    className="p-2 hover:bg-slate-600 rounded-lg text-red-400"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Homework */}
                        {activeTab === 'homework' && (
                            <div className="divide-y divide-slate-700">
                                {homework.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">No homework found</div>
                                ) : (
                                    homework.map(hw => (
                                        <div key={hw.id} className="p-4 flex items-start justify-between hover:bg-slate-700/50">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="font-medium text-white">{hw.title}</div>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${hw.is_active ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                                                        }`}>
                                                        {hw.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-400">{hw.description}</div>
                                                <div className="text-xs text-slate-500 mt-2">
                                                    Category: {hw.category_name} • Max Points: {hw.max_points} • Due: {new Date(hw.due_date).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Created by {hw.created_by_name} • {hw.submissions_count} submissions
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => openEditModal(hw)}
                                                    className="p-2 hover:bg-slate-600 rounded-lg text-blue-400"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(hw)}
                                                    className="p-2 hover:bg-slate-600 rounded-lg text-red-400"
                                                >
                                                    <Trash2 size={18} />
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            {modalType === 'create' ? 'Create' : 'Edit'} {activeTab === 'categories' ? 'Category' : activeTab === 'videos' ? 'Video' : activeTab === 'blog' ? 'Post' : 'Homework'}
                        </h2>
                        <form onSubmit={modalType === 'create' ? handleCreate : handleUpdate} className="space-y-4">
                            {/* Category Form */}
                            {activeTab === 'categories' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Slug *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.slug || ''}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Video Form */}
                            {activeTab === 'videos' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Category ID *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.category || ''}
                                            onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Banner URL</label>
                                        <input
                                            type="url"
                                            value={formData.banner_url || ''}
                                            onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Video URL *</label>
                                        <input
                                            type="url"
                                            required
                                            value={formData.video_url || ''}
                                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Blog Post Form */}
                            {activeTab === 'blog' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Post Type *</label>
                                        <select
                                            value={formData.post_type || 'TEXT'}
                                            onChange={(e) => setFormData({ ...formData, post_type: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        >
                                            <option value="TEXT">Text</option>
                                            <option value="ACHIEVEMENT">Achievement</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Content *</label>
                                        <textarea
                                            required
                                            rows="4"
                                            value={formData.content || ''}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Homework Form */}
                            {activeTab === 'homework' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                                        <textarea
                                            required
                                            rows="3"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Category ID *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.course_category || ''}
                                            onChange={(e) => setFormData({ ...formData, course_category: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Due Date *</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.due_date || ''}
                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Max Points *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.max_points || 100}
                                            onChange={(e) => setFormData({ ...formData, max_points: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active || false}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="is_active" className="text-sm text-slate-300">Active</label>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    {modalType === 'create' ? 'Create' : 'Update'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
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

export default EduverseManagement;
