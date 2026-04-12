import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Shield, Tag, BarChart2, MessageSquare, 
    CheckCircle, X, Search, Phone, LogOut, ChevronRight, Activity, Trash2, Edit3, ArrowUpRight, ShoppingCart,
    TrendingUp, TrendingDown, Filter, Settings, RefreshCcw, Package, Clock, ShieldCheck
} from 'lucide-react';
import api from '../utils/api';

const AdminPortal = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('finance');
    const [searchQuery, setSearchQuery] = useState('');
    const [assetFilter, setAssetFilter] = useState('PENDING_VERIFICATION');
    const [allUsers, setAllUsers] = useState([]);
    const [allAssets, setAllAssets] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [systemHealth, setSystemHealth] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAsset, setEditingAsset] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', price: '', category: '', condition: '', description: '', serviceFee: 0 });
    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, assetId: null, reason: '' });
    const [newCat, setNewCat] = useState({ name: '' });
    const [pendingFees, setPendingFees] = useState({}); // Tracking fee inputs for pending items
    const [previewAsset, setPreviewAsset] = useState(null); // For inline modal preview
    const [pendingCounts, setPendingCounts] = useState({ pendingAssets: 0, pendingOrders: 0, pendingMessages: 0 });

    useEffect(() => {
        fetchData();
        fetchPendingCounts();
        const interval = setInterval(fetchPendingCounts, 30000); // Refresh counts every 30s
        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchPendingCounts = async () => {
        try {
            const res = await api.get('/admin/counts');
            setPendingCounts(res.data);
        } catch (err) {
            console.error('Failed to fetch counts');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'entities') {
                const userRes = await api.get('/admin/users');
                setAllUsers(userRes.data);
            } else if (activeTab === 'verification') {
                const assetRes = await api.get('/admin/assets');
                setAllAssets(assetRes.data);
            } else if (activeTab === 'orders') {
                const orderRes = await api.get('/orders');
                setOrders(orderRes.data);
            } else if (activeTab === 'finance' || activeTab === 'analytics') {
                const [transRes, healthRes] = await Promise.all([
                    api.get('/ledger/transactions'),
                    api.get('/admin/health')
                ]);
                setTransactions(transRes.data);
                setSystemHealth(healthRes.data);
            } else if (activeTab === 'categories') {
                const catRes = await api.get('/categories');
                setCategories(catRes.data);
            } else if (activeTab === 'support') {
                const res = await api.get('/messages');
                setMessages(res.data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/admin/assets/${id}`, { status: 'LIVE' });
            fetchData();
            fetchPendingCounts();
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await api.post(`/admin/assets/${id}/reject`, { reason });
            fetchData();
            fetchPendingCounts();
        } catch (err) {
            alert('Rejection failed');
        }
    };

    const handleDeleteAsset = async (id) => {
        if (!confirm('Permanently purge this asset from the market?')) return;
        try {
            await api.delete(`/admin/assets/${id}`);
            fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Permanent purge user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleEditAsset = (asset) => {
        setEditingAsset(asset);
        setEditForm({
            title: asset.title,
            price: asset.price,
            category: asset.category,
            condition: asset.condition || 'Used',
            description: asset.description,
            serviceFee: asset.serviceFee || Math.round(asset.price * 0.10)
        });
    };

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await api.patch(`/admin/orders/${id}`, { status });
            fetchData();
            fetchPendingCounts();
        } catch (err) {
            alert('Status update failed');
        }
    };

    const handleCapture = async (id) => {
        try {
            await api.post(`/ledger/capture/${id}`);
            fetchData();
        } catch (err) {
            alert('Capture failed');
        }
    };

    const handleSettle = async (id) => {
        try {
            await api.post(`/ledger/settle/${id}`);
            fetchData();
        } catch (err) {
            alert('Settlement failed');
        }
    };

    const handleVerify = async (id, fee) => {
        try {
            await api.patch(`/admin/assets/${id}`, { status: 'LIVE', serviceFee: fee });
            fetchData();
        } catch (err) {
            alert('Verification failed');
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', newCat);
            setNewCat({ name: '', bnName: '' });
            fetchData();
        } catch (err) {
            alert('Add category failed');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Delete category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const startEditing = (asset) => {
        setEditingAsset(asset);
        setEditForm({
            title: asset.title,
            price: asset.price,
            category: asset.category,
            condition: asset.condition || 'Used',
            description: asset.description
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/admin/assets/${editingAsset._id}`, editForm);
            setEditingAsset(null);
            fetchData();
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleFeeChange = (assetId, value) => {
        setPendingFees(prev => ({ ...prev, [assetId]: value }));
    };

    const handlePreviewClick = async (item) => {
        setPreviewAsset(item);
        if (!item.viewByAdminAt && item.status === 'PENDING_VERIFICATION') {
            try {
                await api.patch(`/admin/assets/${item._id}/view`);
            } catch (err) {
                console.error('Failed to mark as viewed');
            }
        }
    };

    const navItems = [
        { id: 'finance', label: 'Financial Hub', icon: Activity, count: 0 },
        { id: 'verification', label: 'Requested Items', icon: CheckCircle, count: pendingCounts.pendingAssets },
        { id: 'orders', label: 'Order Flow', icon: ShoppingCart, count: pendingCounts.pendingOrders },
        { id: 'entities', label: 'System Entities', icon: Users, count: 0 },
        { id: 'support', label: 'Live Support', icon: MessageSquare, count: pendingCounts.pendingMessages },
        { id: 'analytics', label: 'Activity & Stats', icon: BarChart2, count: 0 },
        { id: 'categories', label: 'Market Categories', icon: Tag, count: 0 },
    ];

    const AdminStatsSkeleton = () => (
        <div className="grid grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-3xl" />
            ))}
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
            {/* Sidebar Section */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 260 : 70 }}
                className="bg-[#0F172A] text-white h-screen flex flex-col shadow-2xl z-50 overflow-hidden relative"
            >
                <div className="p-8 flex items-center gap-4 relative">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-accent/20 transition-transform">
                        <Shield className="text-primary" size={20} />
                    </div>
                    {isSidebarOpen && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent/80">MANAGER</span>
                            <span className="text-lg font-black tracking-tighter leading-none text-white whitespace-nowrap">RESELL <span className="text-accent">MANIA</span></span>
                        </motion.div>
                    )}
                </div>

                <nav className="flex-grow p-3 space-y-1 mt-6">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all relative group ${
                                activeTab === item.id 
                                ? 'bg-accent text-primary shadow-xl shadow-accent/5' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <item.icon size={18} className={activeTab === item.id ? 'stroke-[3px]' : 'opacity-70'} />
                            {isSidebarOpen && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
                                    {item.label}
                                </motion.span>
                            )}
                            {item.count > 0 && (
                                <span className={`absolute right-3 px-1.5 py-0.5 rounded-md text-[7px] font-black ${
                                    activeTab === item.id ? 'bg-primary text-accent' : 'bg-red-500 text-white'
                                } shadow-lg`}>
                                    {item.count}
                                </span>
                            )}
                            {activeTab === item.id && (
                                <motion.div layoutId="activeInd" className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6 space-y-3">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center justify-center p-3 rounded-xl bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                        <ChevronRight className={`transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : ''}`} size={16} />
                    </button>
                    <button 
                        onClick={() => { localStorage.removeItem('token'); localStorage.setItem('user', '{}'); window.location.href = '/login'; }}
                        className="w-full flex items-center gap-4 p-4 rounded-xl text-red-400 hover:bg-red-400/10 transition-all group"
                    >
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        {isSidebarOpen && <span className="font-black text-[10px] uppercase tracking-widest">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden relative">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 py-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">
                            {navItems.find(i => i.id === activeTab)?.label}
                        </h1>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Management Console / {activeTab}</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input 
                                type="text"
                                placeholder="Search system resources..."
                                className="bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-3 font-bold text-sm w-64 focus:ring-2 focus:ring-accent transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl pr-4 border border-gray-100">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-accent font-black">HK</div>
                            <div className="text-left">
                                <p className="text-xs font-black text-primary leading-none uppercase">Hasib Khan</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Master Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 pb-32">
                    {loading ? (
                        <AdminStatsSkeleton />
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            {/* Finance Hub */}
                            {activeTab === 'finance' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gross Volume</p>
                                            <p className="text-3xl font-black text-primary tracking-tighter">৳{systemHealth?.volume?.toLocaleString()}</p>
                                            <div className="mt-4 flex items-center gap-2 text-green-500 font-bold text-xs ring-1 ring-green-100 bg-green-50 px-2 py-1 rounded-full w-fit">
                                                <TrendingUp size={12} /> +12.5%
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inbound Pipe</p>
                                            <p className="text-3xl font-black text-primary tracking-tighter">৳{systemHealth?.inboundPipeline?.toLocaleString()}</p>
                                            <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-wide">Awaiting capture</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vault Balance</p>
                                            <p className="text-3xl font-black text-success tracking-tighter">৳{systemHealth?.escrowVault?.toLocaleString()}</p>
                                            <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-wide">Secure platform clearing</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Perfect Deliveries</p>
                                            <p className="text-3xl font-black text-primary tracking-tighter">{systemHealth?.perfectDeliveries || 0}</p>
                                            <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-wide">100% completion rate</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                            <h2 className="text-xl font-black text-primary tracking-tighter uppercase">Operational Queue</h2>
                                            <button className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2 hover:underline">
                                                <Filter size={14} /> Advanced Filter
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <th className="px-8 py-4">Protocol ID</th>
                                                        <th className="px-8 py-4">Gross Transferred</th>
                                                        <th className="px-8 py-4">Fee (10%)</th>
                                                        <th className="px-8 py-4">Status</th>
                                                        <th className="px-8 py-4 text-right">Moderation</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {transactions.filter(t => t._id.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                                                        <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-8 py-5 font-mono text-[10px] text-gray-400">#{t._id.slice(-8).toUpperCase()}</td>
                                                            <td className="px-8 py-5">
                                                                <p className="text-sm font-black text-primary">৳{t.grossAmount.toFixed(2)}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(t.createdAt).toLocaleDateString()}</p>
                                                            </td>
                                                            <td className="px-8 py-5 text-sm font-black text-accent">৳{t.adminFee.toFixed(2)}</td>
                                                            <td className="px-8 py-5">
                                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                                    t.status === 'SETTLED' ? 'bg-green-50 text-green-600 border-green-100' : 
                                                                    t.status === 'FUNDS_CAPTURED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                                                    'bg-orange-50 text-orange-600 border-orange-100'
                                                                }`}>
                                                                    {t.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                {t.status === 'AWAITING_FUNDS' && (
                                                                    <button onClick={() => handleCapture(t._id)} className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-colors shadow-lg shadow-primary/20">Capture</button>
                                                                )}
                                                                {t.status === 'FUNDS_CAPTURED' && (
                                                                    <button onClick={() => handleSettle(t._id)} className="bg-accent text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20">Settle</button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Verification Tab */}
                            {activeTab === 'verification' && (
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="flex gap-2">
                                            {[
                                                { id: 'PENDING_VERIFICATION', label: 'Requested', color: 'orange' },
                                                { id: 'LIVE', label: 'Live Catalog', color: 'green' },
                                                { id: 'REJECTED', label: 'Rejected', color: 'red' }
                                            ].map(tab => (
                                                <button 
                                                    key={tab.id}
                                                    onClick={() => setAssetFilter(tab.id)}
                                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        assetFilter === tab.id 
                                                        ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-200` 
                                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {tab.label} ({allAssets.filter(a => a.status === tab.id).length})
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                                        {(assetFilter === 'LIVE' ? [...new Set(allAssets.map(a => a.category))].sort().flatMap(cat => [
                                            { type: 'header', label: cat },
                                            ...allAssets.filter(a => a.status === assetFilter && a.category === cat)
                                        ]) : allAssets.filter(a => a.status === assetFilter))
                                            .filter(a => a.type === 'header' || a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || a._id.includes(searchQuery))
                                            .map((item, idx) => item.type === 'header' ? (
                                                <div key={`header-${item.label}`} className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 pt-10 pb-4">
                                                    <h3 className="text-xs font-black text-accent uppercase tracking-[0.3em] flex items-center gap-4">
                                                        {item.label}
                                                        <div className="h-[1px] bg-gray-100 flex-grow" />
                                                    </h3>
                                                </div>
                                            ) : (
                                            <motion.div 
                                                layout
                                                key={item._id} 
                                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all"
                                            >
                                                <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                                                    <img src={item.productImages?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 font-bold" />
                                                    <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-accent uppercase tracking-widest border border-white/10">
                                                        {item.category}
                                                    </div>
                                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                                                        item.status === 'LIVE' ? 'bg-green-500 text-white' : 
                                                        item.status === 'REJECTED' ? 'bg-red-500 text-white' : 
                                                        'bg-orange-500 text-white'
                                                    }`}>
                                                        {item.status.replace('_', ' ')}
                                                    </div>
                                                </div>
                                                <div className="p-6 space-y-4 flex-grow">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-base font-black text-primary leading-tight line-clamp-2">{item.title}</h3>
                                                        <span className="text-xs font-black text-primary bg-accent px-2.5 py-1 rounded-lg">৳{item.price}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 py-3 border-y border-gray-50">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-[10px] font-black text-primary">
                                                            {item.seller?.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Sender</p>
                                                            <p className="text-[10px] font-bold text-primary">{item.seller?.name} ({item.seller?.phone})</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50/50 p-4 rounded-2xl space-y-2 border border-gray-100/50">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Protocol Intake</span>
                                                            <span className="text-[10px] font-black text-primary">{new Date(item.createdAt).toLocaleString()}</span>
                                                        </div>
                                                        {item.verifiedAt && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Authorized On</span>
                                                                <span className="text-[10px] font-black text-success">{new Date(item.verifiedAt).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">System Fee</span>
                                                            <div className="flex items-center gap-2">
                                                                {item.status === 'PENDING_VERIFICATION' ? (
                                                                    <input 
                                                                        type="number"
                                                                        className="w-20 bg-white border border-gray-200 rounded px-2 py-0.5 text-[10px] font-black"
                                                                        value={pendingFees[item._id] === undefined ? Math.round(item.price * 0.10) : pendingFees[item._id]}
                                                                        onChange={(e) => handleFeeChange(item._id, e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <span className="text-[10px] font-black text-accent">৳{(item.serviceFee || Math.round(item.price * 0.10)).toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {item.status === 'REJECTED' && (
                                                            <div className="pt-2 border-t border-red-100">
                                                                <p className="text-[9px] font-black text-red-500 uppercase mb-1">Failure Report</p>
                                                                <p className="text-[10px] text-red-400 font-medium italic">"{item.rejectionReason}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button 
                                                                onClick={() => handlePreviewClick(item)} 
                                                                className="bg-primary text-accent py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all font-bold"
                                                            >
                                                                Preview
                                                            </button>
                                                            {item.status === 'PENDING_VERIFICATION' && (
                                                                <button 
                                                                    onClick={() => {
                                                                        const fee = pendingFees[item._id] || Math.round(item.price * 0.10);
                                                                        handleVerify(item._id, parseFloat(fee));
                                                                    }} 
                                                                    className="bg-success text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-green-200 transition-all font-bold"
                                                                >
                                                                    Authorize
                                                                </button>
                                                            )}
                                                            {item.status === 'REJECTED' && (
                                                                <button onClick={() => setRejectionModal({ isOpen: true, assetId: item._id, reason: '' })} className="bg-orange-500 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-orange-200 transition-all font-bold">Retry</button>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleEditAsset(item)} className="flex-1 py-3 rounded-xl bg-white border border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">Modify</button>
                                                            <button onClick={() => handleDeleteAsset(item._id)} className="flex-1 py-3 rounded-xl bg-red-50 text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-100 transition-all">Delete</button>
                                                        </div>
                                                    </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Order Tab */}
                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-50">
                                            <h2 className="text-xl font-black text-primary tracking-tighter uppercase font-sans">Strategic Order Pipelines</h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <th className="px-8 py-4">Structure</th>
                                                        <th className="px-8 py-4">Client Lifecycle</th>
                                                        <th className="px-8 py-4">Fulfillment Phase</th>
                                                        <th className="px-8 py-4 text-right">Moderation</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {orders.filter(o => o.shippingInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) || o._id.includes(searchQuery)).map(order => (
                                                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-8 py-6">
                                                                <p className="text-sm font-black text-primary leading-tight">{order.asset?.title}</p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded uppercase tracking-tighter">৳{order.totalPrice}</span>
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">#ORD-{order._id.slice(-6).toUpperCase()}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 font-black">
                                                                        {order.shippingInfo.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-primary leading-none uppercase">{order.shippingInfo.name}</p>
                                                                        <p className="text-xs font-bold text-gray-400 mt-1">{order.shippingInfo.phone}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex flex-col gap-3">
                                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                                        <div className="space-y-0.5">
                                                                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Order Intake</p>
                                                                            <p className="text-[9px] font-bold text-primary">{new Date(order.createdAt).toLocaleString()}</p>
                                                                        </div>
                                                                        {order.confirmedAt && (
                                                                            <div className="space-y-0.5">
                                                                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Validated At</p>
                                                                                <p className="text-[9px] font-bold text-success">{new Date(order.confirmedAt).toLocaleString()}</p>
                                                                            </div>
                                                                        )}
                                                                        <div className="space-y-0.5">
                                                                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Client Location</p>
                                                                            <p className="text-[9px] font-bold text-primary capitalize">{order.shippingInfo.location}</p>
                                                                        </div>
                                                                        <div className="space-y-0.5">
                                                                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                                                                            <p className="text-[9px] font-bold text-primary capitalize">{order.paymentMethod}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                                                        <div className={`w-3 h-3 rounded-full ${order.status === 'PENDING' ? 'bg-orange-400 animate-pulse' : 'bg-green-500'}`} />
                                                                        <div className="flex-grow h-1 bg-gray-100 rounded-full relative">
                                                                            <motion.div 
                                                                                className="absolute left-0 top-0 h-full bg-primary rounded-full"
                                                                                animate={{ width: order.status === 'PENDING' ? '33.3%' : order.status === 'CONFIRMED' ? '66.6%' : '100%' }}
                                                                            />
                                                                        </div>
                                                                        <span className={`text-[7px] font-black uppercase tracking-widest ${
                                                                            order.status === 'SHIPPED' ? 'text-blue-500' : 
                                                                            order.status === 'CONFIRMED' ? 'text-green-500' : 
                                                                            'text-orange-500'
                                                                        }`}>
                                                                            {order.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <input 
                                                                        type="text"
                                                                        placeholder="Coupon Code"
                                                                        className="bg-gray-50 border-none rounded-lg px-3 py-1.5 text-[10px] font-bold w-32 focus:ring-1 focus:ring-accent"
                                                                        defaultValue={order.coupon}
                                                                        onBlur={(e) => api.patch(`/orders/${order._id}/status`, { coupon: e.target.value })}
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        {order.status === 'PENDING' && (
                                                                            <button onClick={() => handleUpdateOrderStatus(order._id, 'CONFIRMED')} className="bg-success text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">Confirm</button>
                                                                        )}
                                                                        {order.status === 'CONFIRMED' && (
                                                                            <button onClick={() => handleUpdateOrderStatus(order._id, 'SHIPPED')} className="bg-primary text-accent px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">Fulfill Shipment</button>
                                                                        )}
                                                                        <button className="text-gray-300 hover:text-primary transition-all"><Settings size={14} /></button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Analytics Tab */}
                            {activeTab === 'analytics' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                                                <Users size={24} />
                                            </div>
                                            <h3 className="text-xl font-black text-primary tracking-tighter uppercase">Most Recurrent Logins</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {systemHealth?.analytics?.mostLoggedIn?.map((u, i) => (
                                                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-black text-accent w-6">#{i+1}</span>
                                                        <div>
                                                            <p className="text-sm font-black text-primary uppercase">{u.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{u.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-primary">{u.loginCount}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Logins recorded</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                                                <Activity size={24} />
                                            </div>
                                            <h3 className="text-xl font-black text-primary tracking-tighter uppercase">Active System Viewers</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {systemHealth?.analytics?.mostActiveViewers?.map((u, i) => (
                                                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-black text-primary w-6">#{i+1}</span>
                                                        <div>
                                                            <p className="text-sm font-black text-primary uppercase">{u.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{u.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-accent">{u.itemsViewedCount}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Items analyzed</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Entities Tab */}
                            {activeTab === 'entities' && (
                                <div className="space-y-8">
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                            <h2 className="text-xl font-black text-primary tracking-tighter uppercase font-sans">User Protocol Index</h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr>
                                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">Full Identity</th>
                                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">Status / Role</th>
                                                        <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">Engagement</th>
                                                        <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">Operations</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {allUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery)).map(u => (
                                                        <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-8 py-5">
                                                                <p className="text-sm font-black text-primary uppercase leading-none">{u.name}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-widest">{u.phone}</p>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-primary text-accent border-primary' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                                                    {u.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5 text-center text-[10px] text-gray-400 font-bold">
                                                                {new Date(u.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-8 py-5 text-right flex justify-end gap-2">
                                                                <button onClick={() => window.open(`tel:${u.phone}`)} className="p-2 text-gray-400 hover:text-green-500 transition-colors"><Phone size={14} /></button>
                                                                <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors" disabled={u.role === 'admin'}><Trash2 size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Support Tab */}
                            {activeTab === 'support' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                            <h2 className="text-xl font-black text-primary tracking-tighter uppercase font-sans">Incoming Inquiries</h2>
                                            <span className="text-[10px] font-black text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-widest">{messages.length} Active Payloads</span>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {messages.map(msg => (
                                                <div key={msg._id} className="p-8 hover:bg-gray-50 transition-colors flex gap-6 items-start group">
                                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-accent font-black text-lg shrink-0 group-hover:scale-110 transition-transform">
                                                        {msg.sender?.name?.[0]}
                                                    </div>
                                                    <div className="flex-grow space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="text-sm font-black text-primary uppercase leading-none">{msg.sender?.name}</h4>
                                                                <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-widest">{msg.sender?.phone} • {new Date(msg.createdAt).toLocaleString()}</p>
                                                            </div>
                                                            {msg.assetId && (
                                                                <div className="bg-gray-100 px-3 py-1 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                                                                    Context: {msg.assetId.title}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-primary font-medium leading-relaxed bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                                                            {msg.content}
                                                        </p>
                                                        <div className="flex gap-4 pt-2">
                                                            <button onClick={() => window.open(`tel:${msg.sender?.phone}`)} className="text-[10px] font-black text-success uppercase tracking-widest flex items-center gap-1 hover:underline">
                                                                <Phone size={12} /> Dial Client
                                                            </button>
                                                            <button className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1 hover:text-primary transition-colors">
                                                                <CheckCircle size={12} /> Mark Resolved
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {messages.length === 0 && (
                                                <div className="py-24 text-center space-y-4">
                                                    <MessageSquare className="mx-auto text-gray-100" size={64} />
                                                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">No active transmissions detected</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Categories Tab */}
                            {activeTab === 'categories' && (
                                <div className="space-y-8">
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                        <h2 className="text-xl font-black text-primary tracking-tighter uppercase">Market Segment Manager</h2>
                                        <form onSubmit={handleAddCategory} className="flex gap-4">
                                            <input 
                                                className="flex-grow bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm" 
                                                placeholder="Category Label (EN)"
                                                value={newCat.name}
                                                onChange={(e) => setNewCat({...newCat, name: e.target.value})}
                                            />
                                            <input 
                                                className="flex-grow bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm" 
                                                placeholder="Category Label (BN)"
                                                value={newCat.bnName}
                                                onChange={(e) => setNewCat({...newCat, bnName: e.target.value})}
                                            />
                                            <button type="submit" className="bg-accent text-primary px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-accent/20">Add Schema</button>
                                        </form>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {categories.map(c => (
                                            <div key={c._id} className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center group relative shadow-sm hover:shadow-md transition-all">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl mb-3 flex items-center justify-center text-primary group-hover:bg-accent transition-colors">
                                                    <Tag size={20} />
                                                </div>
                                                <p className="text-xs font-black text-primary uppercase leading-tight line-clamp-1">{c.name}</p>
                                                <button onClick={() => handleDeleteCategory(c._id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg"><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Rejection Modal */}
            {rejectionModal.isOpen && (
                <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-8">
                        <div>
                            <h3 className="text-3xl font-black text-primary tracking-tighter uppercase">Reject Protocol</h3>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">Identify failure points in requested asset</p>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason for Rejection</label>
                            <textarea 
                                className="w-full bg-gray-50 border-none rounded-3xl p-6 font-bold text-sm resize-none h-40 focus:ring-2 focus:ring-red-500" 
                                placeholder="Explain why this item cannot proceed to live state..."
                                value={rejectionModal.reason}
                                onChange={(e) => setRejectionModal({...rejectionModal, reason: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setRejectionModal({ isOpen: false, assetId: null, reason: '' })} className="flex-1 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-gray-100 text-gray-400">Abort</button>
                            <button onClick={() => handleReject(rejectionModal.assetId)} className="flex-1 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-red-500 text-white shadow-lg shadow-red-200">Confirm Reject</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Existing Editor Modal */}
            {editingAsset && (
                <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
                    >
                        <header className="bg-gray-50 px-10 py-8 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">Modify Sequence</h2>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Update existing market resource</p>
                            </div>
                            <button onClick={() => setEditingAsset(null)} className="text-gray-400 hover:text-primary"><X size={24} /></button>
                        </header>
                        <form onSubmit={handleEditSubmit} className="p-10 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource Name</label>
                                <input className="amazon-input bg-gray-50 border-none font-bold" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price Point (৳)</label>
                                    <input type="number" className="amazon-input bg-gray-50 border-none font-bold" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Fee (৳)</label>
                                    <input type="number" className="amazon-input bg-gray-50 border-none font-bold" value={editForm.serviceFee} onChange={(e) => setEditForm({...editForm, serviceFee: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Segment</label>
                                <select className="amazon-input bg-gray-50 border-none font-bold" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} required>
                                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">State Logic</label>
                                <select className="amazon-input bg-gray-50 border-none font-bold" value={editForm.condition} onChange={(e) => setEditForm({...editForm, condition: e.target.value})} required>
                                    <option value="Used">Used</option>
                                    <option value="New">New</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource Narrative</label>
                                <textarea className="amazon-input bg-gray-50 border-none font-bold h-32 resize-none" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} required />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditingAsset(null)} className="flex-1 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-gray-100 text-gray-400">Abort Changes</button>
                                <button type="submit" className="flex-1 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-accent text-primary shadow-lg shadow-accent/20">Commit Sequence</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            <AnimatePresence>
                {previewAsset && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setPreviewAsset(null)}
                            className="absolute inset-0 bg-primary/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-6xl h-[90vh] rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
                        >
                            <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center font-black text-primary">
                                        ID
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-primary tracking-tighter uppercase">{previewAsset.title}</h3>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{previewAsset.category} • {previewAsset.condition}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setPreviewAsset(null)}
                                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
                                >
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </header>
                            <div className="flex-grow overflow-hidden relative bg-gray-50">
                                <iframe 
                                    src={`/asset/${previewAsset._id}?preview=true`} 
                                    className="w-full h-full border-none"
                                    title="Asset Preview"
                                    onLoad={() => fetch(`/api/assets/${previewAsset._id}/view`, { method: 'POST' })}
                                />
                            </div>
                            <footer className="p-8 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Created At</p>
                                        <p className="text-[10px] font-bold text-primary">{new Date(previewAsset.createdAt).toLocaleString()}</p>
                                    </div>
                                    {previewAsset.verifiedAt && (
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Verified At</p>
                                            <p className="text-[10px] font-bold text-success">{new Date(previewAsset.verifiedAt).toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setPreviewAsset(null)}
                                        className="px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-gray-100 text-gray-400 hover:bg-gray-200 transition-all"
                                    >
                                        Close Preview
                                    </button>
                                    {previewAsset.status === 'PENDING_VERIFICATION' && (
                                        <button 
                                            onClick={() => {
                                                const fee = pendingFees[previewAsset._id] || Math.round(previewAsset.price * 0.10);
                                                handleVerify(previewAsset._id, parseFloat(fee));
                                                setPreviewAsset(null);
                                            }}
                                            className="px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-success text-white shadow-xl shadow-green-200 hover:scale-105 transition-all"
                                        >
                                            Authorize Now
                                        </button>
                                    )}
                                </div>
                            </footer>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPortal;
