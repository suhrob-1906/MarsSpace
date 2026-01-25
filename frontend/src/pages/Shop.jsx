import { useEffect, useState } from 'react';
import api from '../services/api';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Shop = () => {
    const { user } = useAuth(); // We might need to refresh user to update wallet, simplified by reloading or context update
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);

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
        if (!user || user.wallet.coins < item.price_coins) {
            alert("Not enough coins!");
            return;
        }

        if (!confirm(`Buy ${item.title} for ${item.price_coins} coins?`)) return;

        setPurchasing(item.id);
        try {
            const res = await api.post('/shop/buy/', { item_id: item.id });
            if (res.data.success) {
                alert("Purchase successful!");
                // Ideally refresh user context here to update coins in topbar
                // For MVP, simplistic hack: reload or re-fetch me
                window.location.reload();
            }
        } catch (err) {
            alert(err.response?.data?.error || "Purchase failed");
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Space Shop</h1>
                    <p className="text-slate-400">Spend your hard-earned coins on cool avatars and boosters.</p>
                </div>
                <div className="bg-surface px-4 py-2 rounded-xl border border-slate-700 font-mono text-amber-500 font-bold">
                    Balance: {user?.wallet?.coins || 0} 🪙
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading shop...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="card group hover:border-primary/50 transition-colors">
                            <div className="h-40 bg-slate-800 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingBag size={48} className="text-slate-600 group-hover:text-primary transition-colors" />
                                )}
                                <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded-lg text-xs font-bold text-white border border-slate-700">
                                    {item.category}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-slate-400 text-sm mb-4 h-10 line-clamp-2">{item.description}</p>

                            <div className="flex items-center justify-between">
                                <div className="text-amber-500 font-bold text-lg">
                                    {item.price_coins} 🪙
                                </div>
                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={purchasing === item.id || user?.wallet?.coins < item.price_coins}
                                    className="btn btn-primary px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {purchasing === item.id ? 'Buying...' : 'Buy Now'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Shop;
