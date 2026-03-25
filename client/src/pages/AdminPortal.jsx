import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, Users, Package, Trash2, Shield, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AdminStatsSkeleton } from '../components/Skeleton';

const AdminPortal = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('finance');
    const [ledger, setLedger] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [pendingAssets, setPendingAssets] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allAssets, setAllAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newCat, setNewCat] = useState({ name: '', bnName: '' });
    const [systemHealth, setSystemHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ pendingAssets: 0, pendingOrders: 0 });
    const [editingAsset, setEditingAsset] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', price: '', description: '', category: '' });

    useEffect(() => {
        api.get('/admin/counts')
            .then(res => setCounts(res.data))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (activeTab === 'finance') {
                    const [ledgerRes, transRes, healthRes] = await Promise.all([
                        api.get('/ledger'),
                        api.get('/ledger/transactions'),
                        api.get('/admin/health')
                    ]);
                    setLedger(ledgerRes.data);
                    setTransactions(transRes.data);
                    setSystemHealth(healthRes.data);
                } else if (activeTab === 'verification') {
                    const res = await api.get('/assets/pending');
                    setPendingAssets(res.data);
                } else if (activeTab === 'entities') {
                    const [usersRes, assetsRes, healthRes] = await Promise.all([
                        api.get('/admin/users'),
                        api.get('/admin/assets'),
                        api.get('/admin/health')
                    ]);
                    setAllUsers(usersRes.data);
                    setAllAssets(assetsRes.data);
                    setSystemHealth(healthRes.data);
                } else if (activeTab === 'categories') {
                    const res = await api.get('/categories');
                    setCategories(res.data);
                } else if (activeTab === 'orders') {
                    const res = await api.get('/orders');
                    setOrders(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch admin data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/categories', newCat);
            setCategories([...categories, res.data]);
            setNewCat({ name: '', bnName: '' });
            localStorage.removeItem('rs_categories_cache');
        } catch (err) {
            alert('Failed to add category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Remove this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(categories.filter(c => c._id !== id));
            localStorage.removeItem('rs_categories_cache');
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    const handleVerify = async (id) => {
        try {
            await api.patch(`/assets/${id}/verify`);
            setPendingAssets(pendingAssets.filter(a => a._id !== id));
        } catch (err) {
            alert('Verification failed');
        }
    };

    const handleCapture = async (id) => {
        try {
            await api.patch(`/ledger/transaction/${id}/capture`);
            const transRes = await api.get('/ledger/transactions');
            setTransactions(transRes.data);
        } catch (err) {
            alert('Capture failed');
        }
    };

    const handleSettle = async (id) => {
        try {
            await api.patch(`/ledger/transaction/${id}/settle`);
            const transRes = await api.get('/ledger/transactions');
            setTransactions(transRes.data);
        } catch (err) {
            alert('Settlement failed');
        }
    };

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to terminate this user protocol? This action is irreversible.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setAllUsers(allUsers.filter(u => u._id !== id));
        } catch (err) {
            alert('User deletion failed');
        }
    };

    const handleDeleteAsset = async (id) => {
        if (!window.confirm('Purge this asset from the market archives?')) return;
        try {
            await api.delete(`/admin/assets/${id}`);
            setAllAssets(allAssets.filter(a => a._id !== id));
        } catch (err) {
            alert('Asset deletion failed');
        }
    };

    const startEditing = (asset) => {
        setEditingAsset(asset);
        setEditForm({
            title: asset.title,
            price: asset.price,
            description: asset.description,
            category: asset.category
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.patch(`/admin/assets/${editingAsset._id}`, editForm);
            setPendingAssets(pendingAssets.map(a => a._id === editingAsset._id ? res.data : a));
            setAllAssets(allAssets.map(a => a._id === editingAsset._id ? res.data : a));
            setEditingAsset(null);
            alert('Asset updated successfully');
        } catch (err) {
            alert('Failed to update asset');
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-primary">{t('admin.title')}</h1>
                    <div className="flex gap-4 mt-4 md:mt-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`text-xs md:text-sm font-bold pb-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'finance' ? 'border-accent text-primary' : 'border-transparent text-gray-400'}`}
                        >
                            {t('admin.finance')}
                        </button>
                        <button
                            onClick={() => setActiveTab('verification')}
                            className={`text-xs md:text-sm font-bold pb-2 border-b-2 transition-colors whitespace-nowrap relative ${activeTab === 'verification' ? 'border-accent text-primary' : 'border-transparent text-gray-400'}`}
                        >
                            {t('admin.verification')} {counts.pendingAssets > 0 && <span className="absolute -top-1 right-0 translate-x-1/2 bg-accent text-primary px-1.5 py-0.5 rounded-full text-[8px] font-black shadow-sm">{counts.pendingAssets}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('entities')}
                            className={`text-xs md:text-sm font-bold pb-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'entities' ? 'border-accent text-primary' : 'border-transparent text-gray-400'}`}
                        >
                            {t('admin.entities')}
                        </button>
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`text-xs md:text-sm font-bold pb-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'categories' ? 'border-accent text-primary' : 'border-transparent text-gray-400'}`}
                        >
                            Category Management
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`text-xs md:text-sm font-bold pb-2 border-b-2 transition-colors whitespace-nowrap relative ${activeTab === 'orders' ? 'border-accent text-primary' : 'border-transparent text-gray-400'}`}
                        >
                            Order Flow {counts.pendingOrders > 0 && <span className="absolute -top-1 right-0 translate-x-1/2 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px] font-black shadow-sm">{counts.pendingOrders}</span>}
                        </button>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400 font-medium">Platform Revenue</p>
                    <p className="text-2xl font-black text-success">৳{systemHealth?.volume?.toLocaleString() || '0.00'}</p>
                </div>
            </header>

            {activeTab === 'finance' && (
                <>
                    {/* Dashboard Stats */}
                    {loading ? (
                        <AdminStatsSkeleton />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-xl border-l-4 border-accent shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Inbound Pipeline</p>
                                        <p className="text-2xl font-black mt-1">৳{systemHealth?.inboundPipeline?.toLocaleString() || '0.00'}</p>
                                    </div>
                                    <TrendingUp className="text-accent" />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">Gross funds awaiting capture from buyers</p>
                            </div>
                            <div className="glass-card p-6 rounded-xl border-l-4 border-success shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Escrow Vault</p>
                                        <p className="text-2xl font-black mt-1">৳{systemHealth?.escrowVault?.toLocaleString() || '0.00'}</p>
                                    </div>
                                    <CheckCircle className="text-success" />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">Successfully held in platform clearing account</p>
                            </div>
                            <div className="glass-card p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Pending Payouts</p>
                                        <p className="text-2xl font-black mt-1">৳{systemHealth?.pendingPayouts?.toLocaleString() || '0.00'}</p>
                                    </div>
                                    <Clock className="text-blue-500" />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">Cleared for release to sellers (90% net protocol)</p>
                            </div>
                        </div>
                    )}

                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-primary">Operational Queue</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] uppercase bg-gray-50 text-gray-400 font-black">
                                    <tr>
                                        <th className="px-6 py-3">Transaction ID</th>
                                        <th className="px-6 py-3">Gross</th>
                                        <th className="px-6 py-3">Fee (10%)</th>
                                        <th className="px-6 py-3">Net (90%)</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium">
                                    {transactions.map((t) => (
                                        <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs italic">{t._id}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-primary">৳{t.grossAmount.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-xs text-gray-400 font-black">৳{t.adminFee.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-green-600 font-black">৳{t.netAmount.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${t.status === 'FUNDS_CAPTURED' ? 'bg-green-100 text-green-700' :
                                                    t.status === 'AWAITING_FUNDS' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {t.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {t.status === 'AWAITING_FUNDS' && (
                                                    <button
                                                        onClick={() => handleCapture(t._id)}
                                                        className="text-[10px] bg-primary text-white px-3 py-1 rounded font-bold hover:bg-secondary transition-colors"
                                                    >
                                                        Confirm Payment
                                                    </button>
                                                )}
                                                {t.status === 'FUNDS_CAPTURED' && (
                                                    <button
                                                        onClick={() => handleSettle(t._id)}
                                                        className="text-[10px] bg-success text-white px-3 py-1 rounded font-bold hover:opacity-90 transition-colors"
                                                    >
                                                        Release (90%)
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}

            {
                activeTab === 'verification' && (
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-primary">Pending Liquidation Requests</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {pendingAssets.map((asset) => (
                                <div key={asset._id} className="border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-40 bg-gray-50 rounded overflow-hidden">
                                        <img src={asset.productImages?.[0] || `https://placehold.co/400x300?text=${encodeURIComponent(asset.title)}`} className="w-full h-full object-cover opacity-80" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-extrabold text-lg text-primary line-clamp-1">{asset.title}</h3>
                                        <div className="flex justify-between items-center text-xs">
                                            <p className="text-gray-500 font-medium">Seller: <span className="text-primary font-bold">{asset.seller?.name || 'Unknown'}</span></p>
                                            <p className="font-black text-accent">৳{asset.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed h-8 font-medium">{asset.description}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleVerify(asset._id)}
                                                className="flex-grow bg-success text-white py-2 rounded text-xs font-black uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => startEditing(asset)}
                                                className="bg-primary text-accent px-3 rounded text-xs font-bold hover:bg-secondary transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => window.open(`/asset/${asset._id}`, '_blank')}
                                                className="bg-gray-100 text-gray-400 px-3 rounded text-xs font-bold hover:bg-accent hover:text-primary transition-colors"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {pendingAssets.length === 0 && (
                                <div className="col-span-full py-24 text-center space-y-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <CheckCircle className="mx-auto text-gray-200" size={48} />
                                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Verification Queue Empty</p>
                                </div>
                            )}
                        </div>
                    </section>
                )
            }

            {
                activeTab === 'entities' && (
                    <div className="space-y-8">
                        {/* System Insight Stats */}
                        {systemHealth && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-primary text-white p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2 mb-2 text-accent">
                                        <Users size={16} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Protocol Users</p>
                                    </div>
                                    <p className="text-2xl font-black">{systemHealth?.users || 0}</p>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <Package size={16} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Assets</p>
                                    </div>
                                    <p className="text-2xl font-black text-primary">{systemHealth?.assets || 0}</p>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <Activity size={16} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transactions</p>
                                    </div>
                                    <p className="text-2xl font-black text-primary">{systemHealth?.transactions || 0}</p>
                                </div>
                                <div className="bg-accent text-primary p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield size={16} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Gross Volume</p>
                                    </div>
                                    <p className="text-2xl font-black">৳{systemHealth?.volume?.toLocaleString() || 0}</p>
                                </div>
                            </div>
                        )}

                        {/* Users Management */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-primary">User Registry</h2>
                                <span className="text-[10px] font-black text-gray-400 uppercase">Live Database Stream</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] uppercase bg-gray-50 text-gray-400 font-black">
                                        <tr>
                                            <th className="px-6 py-3">Member Name</th>
                                            <th className="px-6 py-3">Phone Number</th>
                                            <th className="px-6 py-3">Hierarchy</th>
                                            <th className="px-6 py-3">Rating</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-medium text-sm">
                                        {allUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-primary">{user.name}</td>
                                                <td className="px-6 py-4 text-gray-500 font-mono">{user.phone || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${user.role === 'admin' ? 'bg-primary text-accent' : 'bg-gray-100 text-gray-500'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-accent">★ {user.rating.toFixed(1)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                        disabled={user.role === 'admin'}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* All Products Management */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-primary">Market Inventory Archive</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] uppercase bg-gray-50 text-gray-400 font-black">
                                        <tr>
                                            <th className="px-6 py-3">Product Title</th>
                                            <th className="px-6 py-3">Seller</th>
                                            <th className="px-6 py-3">Price</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Moderation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-medium text-sm">
                                        {allAssets.map((asset) => (
                                            <tr key={asset._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-primary truncate max-w-[200px]">{asset.title}</td>
                                                <td className="px-6 py-4 text-gray-500">{asset.seller?.name || 'Purged'}</td>
                                                <td className="px-6 py-4 font-black text-primary">৳{asset.price.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${asset.status === 'LIVE' ? 'bg-green-100 text-green-700' :
                                                        asset.status === 'PENDING_VERIFICATION' ? 'bg-accent text-primary' :
                                                            'bg-primary text-white'
                                                        }`}>
                                                        {asset.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteAsset(asset._id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )
            }

            {
                activeTab === 'categories' && (
                    <div className="space-y-8">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-primary mb-6">Add New Category</h2>
                            <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Category Name (EN)"
                                    className="amazon-input"
                                    value={newCat.name}
                                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="ক্যাটাগরির নাম (BN)"
                                    className="amazon-input"
                                    value={newCat.bnName}
                                    onChange={(e) => setNewCat({ ...newCat, bnName: e.target.value })}
                                    required
                                />
                                <button type="submit" className="premium-button">Add Category</button>
                            </form>
                        </section>

                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-primary">System Categories</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                                {categories.map((cat) => (
                                    <div key={cat._id} className="p-4 border border-gray-100 rounded-lg flex justify-between items-center group hover:border-accent transition-colors">
                                        <div>
                                            <p className="font-bold text-primary">{cat.name}</p>
                                            <p className="text-xs text-gray-400">{cat.bnName}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCategory(cat._id)}
                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )
            }

            {
                activeTab === 'orders' && (
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-primary">Active Order Protocols</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] uppercase bg-gray-50 text-gray-400 font-black">
                                    <tr>
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3">Buyer / Phone</th>
                                        <th className="px-6 py-3">Location</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium text-sm">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-primary">{order.asset?.title || 'Unknown Asset'}</p>
                                                <p className="text-[10px] text-accent font-black tracking-tighter">৳{order.totalPrice.toLocaleString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-700">{order.shippingInfo.name}</p>
                                                <p className="text-xs text-gray-400">{order.shippingInfo.phone}</p>
                                            </td>
                                            <td className="px-6 py-4 max-w-[200px] truncate text-xs text-gray-500">
                                                {order.shippingInfo.location}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex gap-2 justify-end">
                                                {order.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleUpdateOrderStatus(order._id, 'CONFIRMED')}
                                                        className="bg-success text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider"
                                                    >
                                                        Confirm
                                                    </button>
                                                )}
                                                {order.status === 'CONFIRMED' && (
                                                    <button
                                                        onClick={() => handleUpdateOrderStatus(order._id, 'SHIPPED')}
                                                        className="bg-primary text-accent px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider"
                                                    >
                                                        Ship
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-gray-400 uppercase text-xs font-black tracking-[0.2em]">No order stream detected</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )
            }
            {editingAsset && (
                <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                    >
                        <header className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-primary uppercase tracking-tighter">Edit Product Details</h2>
                            <button onClick={() => setEditingAsset(null)} className="text-gray-400 hover:text-primary"><X size={24} /></button>
                        </header>
                        <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Name</label>
                                <input 
                                    className="amazon-input bg-gray-50 border-none font-bold placeholder:text-gray-300"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Price (৳)</label>
                                <input 
                                    type="number"
                                    className="amazon-input bg-gray-50 border-none font-bold placeholder:text-gray-300"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Category</label>
                                <select 
                                    className="amazon-input bg-gray-50 border-none font-bold"
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                    required
                                >
                                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Condition & Notes</label>
                                <textarea 
                                    className="amazon-input bg-gray-50 border-none font-bold h-32 resize-none"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditingAsset(null)} className="flex-grow py-4 rounded-xl font-black uppercase text-xs tracking-widest bg-gray-100 text-gray-400">Cancel</button>
                                <button type="submit" className="flex-grow py-4 rounded-xl font-black uppercase text-xs tracking-widest bg-accent text-primary shadow-lg shadow-accent/20">Save Changes</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div >
    );
};

export default AdminPortal;
