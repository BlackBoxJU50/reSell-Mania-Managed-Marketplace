import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, ShieldCheck, Clock, CheckCircle, Truck, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const statusColors = {
    PENDING:   'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED:   'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

const statusIcons = {
    PENDING:   <Clock size={14} />,
    CONFIRMED: <CheckCircle size={14} />,
    SHIPPED:   <Truck size={14} />,
    DELIVERED: <CheckCircle size={14} />,
};

const UserDashboard = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [listings, setListings]   = useState([]);
    const [orders, setOrders]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [activeView, setActiveView] = useState('listings');
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
    const [passwordStatus, setPasswordStatus] = useState({ loading: false, message: '', error: '' });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordStatus({ loading: true, message: '', error: '' });
        try {
            const res = await api.patch('/auth/change-password', passwordForm);
            setPasswordStatus({ loading: false, message: res.data.message, error: '' });
            setPasswordForm({ currentPassword: '', newPassword: '' });
        } catch (err) {
            setPasswordStatus({ loading: false, message: '', error: err.response?.data?.message || 'Failed to update password' });
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [listingsRes, ordersRes] = await Promise.all([
                    api.get('/assets/my-listings'),
                    api.get('/orders/my-orders'),
                ]);
                setListings(listingsRes.data);
                setOrders(ordersRes.data);
            } catch (err) {
                console.error('Failed to fetch user data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="p-12 text-center">
            <p className="uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 animate-pulse italic">
                {t('home.loading')}
            </p>
        </div>
    );

    return (
        <div className="space-y-6 md:space-y-8 px-2 md:px-0">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tighter">My Account</h1>
                    <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest">
                        Track your sales and orders
                    </p>
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 self-start">
                    <button
                        onClick={() => setActiveView('listings')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === 'listings' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-400 hover:text-primary'}`}
                    >
                        My Items ({listings.length})
                    </button>
                    <button
                        onClick={() => setActiveView('orders')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === 'orders' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-400 hover:text-primary'}`}
                    >
                        My Purchases ({orders.length})
                    </button>
                    <button
                        onClick={() => setActiveView('settings')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === 'settings' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-400 hover:text-primary'}`}
                    >
                        <Settings size={16} className="inline-block mr-1" /> Settings
                    </button>
                </div>

            </header>

            {activeView === 'listings' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {listings.map((asset) => (
                        <motion.div
                            key={asset._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
                        >
                            <div className="h-44 md:h-52 bg-gray-50 relative overflow-hidden">
                                <img
                                    src={asset.productImages?.[0] || `https://placehold.co/400x300?text=${encodeURIComponent(asset.title)}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    alt={asset.title}
                                />
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${
                                    asset.status === 'LIVE' ? 'bg-success text-white' :
                                    asset.status === 'PENDING_VERIFICATION' ? 'bg-accent text-primary' :
                                    'bg-primary text-white'
                                }`}>
                                    {asset.status.replace(/_/g, ' ')}
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <h3 className="font-extrabold text-lg text-primary line-clamp-1 group-hover:text-accent transition-colors">{asset.title}</h3>
                                <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Price</p>
                                        <p className="text-2xl font-black text-primary">৳{asset.price.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">You will get</p>
                                        <p className="text-lg font-black text-success tracking-tighter">৳{(asset.price * 0.9).toLocaleString()}</p>
                                    </div>
                                </div>
                                {asset.status === 'PENDING_VERIFICATION' && (
                                    <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-xl border border-accent/10">
                                        <div className="bg-accent/20 p-2 rounded-lg">
                                            <ShieldCheck size={16} className="text-accent" />
                                        </div>
                                        <p className="text-[10px] text-primary/70 font-bold leading-snug">
                                            Our team is checking your product. It will be live soon!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {listings.length === 0 && (
                        <div className="col-span-full py-24 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center">
                            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                                <Package className="text-gray-300 w-10 h-10" />
                            </div>
                            <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">No Active Products Found</p>
                            <button
                                onClick={() => navigate('/sell')}
                                className="mt-6 px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-accent hover:text-primary transition-all shadow-lg active:scale-95"
                            >
                                Start Selling Now
                            </button>
                        </div>
                    )}
                </div>
            ) : activeView === 'orders' ? (
                /* Orders Tab */
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 p-16 md:p-24 text-center space-y-6 shadow-sm">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
                                <ShoppingBag className="text-gray-200" size={36} />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-primary tracking-tight">No Orders Yet</h3>
                            <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed text-sm">
                                Browse verified products and place your first order today.
                            </p>
                            <Link to="/" className="inline-block premium-button text-xs font-black uppercase tracking-widest">
                                Explore Products
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <h2 className="font-black text-primary text-base uppercase tracking-wider">Order History</h2>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {orders.map((order) => (
                                    <motion.div
                                        key={order._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                                <img
                                                    src={order.asset?.productImages?.[0] || `https://placehold.co/64x64?text=P`}
                                                    className="w-full h-full object-cover"
                                                    alt={order.asset?.title}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-sm line-clamp-1">{order.asset?.title || 'Product'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">
                                                    Payment: {order.paymentMethod}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                    📍 {order.shippingInfo?.location}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                                            <p className="text-xl font-black text-primary">৳{order.totalPrice?.toLocaleString()}</p>
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {statusIcons[order.status]} {order.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : activeView === 'settings' ? (
                <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                    <header className="space-y-1 border-b border-gray-50 pb-4">
                        <h2 className="text-xl font-black text-primary uppercase tracking-tighter">Security Settings</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update your password securely</p>
                    </header>

                    {passwordStatus.message && (
                        <div className="bg-success/10 text-success p-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-success/20">
                            {passwordStatus.message}
                        </div>
                    )}
                    {passwordStatus.error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-100">
                            {passwordStatus.error}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Password</label>
                            <input
                                required
                                type="password"
                                className="amazon-input bg-gray-50 border-none font-bold placeholder:text-gray-300 py-3 rounded-xl"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Password</label>
                            <input
                                required
                                type="password"
                                minLength={6}
                                className="amazon-input bg-gray-50 border-none font-bold placeholder:text-gray-300 py-3 rounded-xl"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={passwordStatus.loading}
                            className="w-full bg-accent text-primary py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-accent/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {passwordStatus.loading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            ) : null}
        </div>
    );
};

export default UserDashboard;
