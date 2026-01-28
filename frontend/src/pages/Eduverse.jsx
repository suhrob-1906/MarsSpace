import { useState, useEffect } from 'react';
import { Video, FileText, Globe, Heart, Share2 } from 'lucide-react';
import api from '../services/api';

const Eduverse = () => {
    const [activeTab, setActiveTab] = useState('videos');
    const [categories, setCategories] = useState([]);
    const [videos, setVideos] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [catsRes, vidsRes, blogsRes] = await Promise.all([
                api.get('/eduverse/categories/'),
                api.get('/eduverse/videos/'),
                api.get('/blog/posts/')
            ]);
            setCategories(catsRes.data);
            setVideos(vidsRes.data);
            setBlogPosts(blogsRes.data);
        } catch (error) {
            console.error('Failed to fetch Eduverse data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await api.post(`/blog/posts/${postId}/like/`);
            setBlogPosts(posts => posts.map(p =>
                p.id === postId ? { ...p, like_count: res.data.like_count } : p
            ));
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };

    return (
        <div className="space-y-8 p-6 pb-24">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 p-8 text-white min-h-[200px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Globe size={150} />
                </div>
                <h1 className="text-4xl font-bold mb-2 z-10">Eduverse</h1>
                <p className="text-indigo-200 text-lg z-10 max-w-xl">
                    Explore the universe of knowledge. Watch videos, read articles, and stay updated with the latest from MarsSpace.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-700/50 pb-1">
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`pb-3 px-4 text-sm font-medium transition-all relative ${activeTab === 'videos'
                            ? 'text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <Video size={18} />
                        Videos & Content
                    </span>
                    {activeTab === 'videos' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('blog')}
                    className={`pb-3 px-4 text-sm font-medium transition-all relative ${activeTab === 'blog'
                            ? 'text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <FileText size={18} />
                        Community Blog
                    </span>
                    {activeTab === 'blog' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-emerald-500" />
                    )}
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {activeTab === 'videos' && (
                        <div className="space-y-10">
                            {categories.map(category => {
                                const categoryVideos = videos.filter(v => v.category === category.id);
                                if (categoryVideos.length === 0) return null;

                                return (
                                    <div key={category.id} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                                <span className="w-1 h-8 bg-blue-500 rounded-full mr-2"></span>
                                                {category.title}
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {categoryVideos.map(video => (
                                                <div key={video.id} className="group bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-800 transition-all hover:scale-[1.02] duration-300 shadow-lg">
                                                    <div className="aspect-video bg-slate-900 relative">
                                                        {video.banner_url ? (
                                                            <img
                                                                src={video.banner_url}
                                                                alt={video.title}
                                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                                <Video size={48} />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 leading-snug">
                                                            {video.title}
                                                        </h3>
                                                        <a
                                                            href={video.video_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                                                        >
                                                            Watch Now <Share2 size={14} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'blog' && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {blogPosts.length === 0 ? (
                                <div className="text-center py-20 text-slate-400 bg-slate-800/20 rounded-2xl border border-slate-700/30">
                                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">No blog posts yet. Stay tuned!</p>
                                </div>
                            ) : (
                                blogPosts.map(post => (
                                    <div key={post.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-colors">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                    {post.author_name?.[0] || 'A'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">{post.author_name}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            {post.post_type === 'ACHIEVEMENT' && (
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                                                    <Trophy size={12} /> Achievement
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-base">
                                            {post.content}
                                        </div>

                                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-700/30">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors group"
                                            >
                                                <Heart size={18} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-sm font-medium">{post.like_count} Likes</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Eduverse;
