import { useEffect, useState } from 'react';
import api from '../services/api';
import { ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Shop = () => {
    const { user, refreshUser } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await api.get('/shop/items/');
            setItems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item) => {
        setError('');
        setSuccess('');

        if (!user || user.coins < item.price_coins) {
            setError(`Insufficient funds! You have ${user?.coins || 0} coins, but need ${item.price_coins} coins.`);
            return;
        }

        if (!confirm(`Buy ${item.title} for ${item.price_coins} coins?`)) return;

        setPurchasing(item.id);
        try {
            const res = await api.post('/shop/buy/', { item_id: item.id });
            if (res.data.success) {
                setSuccess(`Purchase successful! You bought ${item.title}.`);
                if (refreshUser) {
                    await refreshUser();
                }
                setTimeout(() => setSuccess(''), 5000);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Purchase failed. Please try again.");
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Space Shop</h1>
                    <p className="text-slate-500">Spend your hard-earned coins on cool items and boosters.</p>
                </div>
                <div className="bg-white border border-orange-200 px-6 py-3 rounded-xl font-mono text-amber-600 font-bold shadow-sm">
                    Balance: {user?.coins || 0} 🪙
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="font-bold text-red-800 mb-1">Error</h4>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="font-bold text-green-800 mb-1">Success!</h4>
                        <p className="text-green-700 text-sm">{success}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-slate-500">Loading shop...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingBag size={48} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-700 border border-slate-200">
                                    {item.category}
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-sm mb-4 h-10 line-clamp-2">{item.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="text-amber-600 font-bold text-xl flex items-center gap-1">
                                        {item.price_coins} 🪙
                                    </div>
                                    <button
                                        onClick={() => handleBuy(item)}
                                        disabled={purchasing === item.id || user?.coins < item.price_coins}
                                        className={`px-6 py-2 rounded-lg font-medium transition-all ${purchasing === item.id || user?.coins < item.price_coins
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:shadow-md'
                                            }`}
                                    >
                                        {purchasing === item.id ? 'Buying...' : 'Buy Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Shop;
