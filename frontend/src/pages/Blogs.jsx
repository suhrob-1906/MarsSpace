import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Heart, Image as ImageIcon, Send, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Blogs = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Post State
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/eduverse/blog-posts/');
            setPosts(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setCreating(true);
        try {
            const postData = {
                content: newPostContent,
                post_type: 'TEXT',
                image_url: newPostImage
            };

            await api.post('/eduverse/blog-posts/', postData);
            toast.success('Post created successfully!');
            setShowCreateModal(false);
            setNewPostContent('');
            setNewPostImage('');
            fetchPosts();
        } catch (error) {
            console.error('Failed to create post:', error);
            toast.error('Failed to create post');
        } finally {
            setCreating(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const response = await api.post(`/eduverse/blog-posts/${postId}/like/`);
            setPosts(posts.map(post =>
                post.id === postId ? { ...post, like_count: response.data.like_count } : post
            ));
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Student Blogs</h1>
                    <p className="text-slate-500">Share your achievements and thoughts!</p>
                </div>
                {user?.has_premium && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1"
                    >
                        <MessageSquare size={20} />
                        Create Post
                    </button>
                )}
            </div>

            {!user?.has_premium && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
                        👑
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Premium Feature</h3>
                        <p className="text-sm text-slate-600">Only premium students can create posts. Others can view and like.</p>
                    </div>
                </div>
            )}

            {/* Posts List */}
            <div className="space-y-6">
                {posts.map(post => (
                    <div key={post.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                {post.author_name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">{post.author_name}</div>
                                <div className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <p className="text-slate-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                        {post.image_url && (
                            <img src={post.image_url} alt="Post content" className="rounded-xl w-full max-h-96 object-cover mb-4 bg-slate-50" />
                        )}

                        <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                            <button
                                onClick={() => handleLike(post.id)}
                                className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors group"
                            >
                                <Heart size={20} className="group-hover:fill-red-500" />
                                <span className="font-medium">{post.like_count}</span>
                            </button>
                        </div>
                    </div>
                ))}

                {posts.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-400">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No posts yet. Be the first to share!</p>
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Post</h2>

                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <div>
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="w-full h-32 p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500 resize-none text-slate-800 placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Image URL (Optional)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={newPostImage}
                                        onChange={(e) => setNewPostImage(e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1 p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                                    />
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                        <ImageIcon size={20} />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={creating || !newPostContent.trim()}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {creating ? 'Publishing...' : (
                                    <>
                                        <Send size={20} />
                                        Publish Post
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Blogs;
