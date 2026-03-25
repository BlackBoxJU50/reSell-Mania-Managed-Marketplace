import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, Truck, RotateCcw, Lock, DollarSign, Play, X } from 'lucide-react';

const AssetDetails = () => {
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    const [shippingInfo, setShippingInfo] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        location: user?.location || '',
        paymentMethod: 'Cash on Delivery'
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const res = await api.get(`/assets/${id}`);
                setAsset(res.data);
            } catch (err) {
                console.error('Failed to fetch asset');
            } finally {
                setLoading(false);
            }
        };
        fetchAsset();
    }, [id]);

    const [orderSuccess, setOrderSuccess] = useState(false);

    const handleOrder = async (e) => {
        e.preventDefault();
        setOrderLoading(true);
        try {
            const orderData = {
                assetId: id,
                shippingInfo: {
                    name: shippingInfo.name,
                    phone: shippingInfo.phone,
                    location: shippingInfo.location
                },
                paymentMethod: shippingInfo.paymentMethod
            };

            if (shippingInfo.phone !== user?.phone || shippingInfo.location !== user?.location) {
                await api.patch('/auth/update-profile', {
                    phone: shippingInfo.phone,
                    location: shippingInfo.location
                });
                const updatedUser = { ...user, phone: shippingInfo.phone, location: shippingInfo.location };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            await api.post('/orders', orderData);
            setOrderSuccess(true);
            setShowOrderForm(false);
        } catch (err) {
            console.error('Order error:', err);
            alert('Failed to place order: ' + (err.response?.data?.message || err.message));
        } finally {
            setOrderLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Opening Vault...</div>;
    if (!asset) return <div className="p-8 text-center">Asset not found.</div>;

    if (orderSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xl space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                    <ShieldCheck size={40} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">Order Placed Successfully!</h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Transmission Successful • Queue Status: Pending</p>
                </div>
                <p className="max-w-xs text-center text-sm text-gray-500 font-medium">
                    Your order has been recorded in the protocol. A Manager will verify and ship your asset shortly.
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-secondary transition-colors"
                    >
                        View Orders
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Gallery */}
            <div className="md:col-span-1 hidden lg:flex flex-col gap-4">
                {(asset.productImages && asset.productImages.length > 0 ? asset.productImages : [1, 2, 3]).map((img, i) => (
                    <div key={i} className="aspect-square bg-white border border-gray-200 rounded p-1 cursor-pointer hover:border-accent overflow-hidden">
                        <img
                            src={typeof img === 'string' ? img : `https://placehold.co/100x100?text=View+${i + 1}`}
                            className="w-full h-full object-cover"
                            alt={`View ${i + 1}`}
                        />
                    </div>
                ))}
            </div>

            <div className="md:col-span-6 lg:col-span-5 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 overflow-hidden">
                    <img
                        src={asset.productImages?.[0] || `https://placehold.co/600x600?text=${encodeURIComponent(asset.title)}`}
                        className="w-full rounded-lg h-auto object-cover max-h-[600px]"
                        alt={asset.title}
                    />
                </div>

                {asset.productVideo && (
                    <div className="bg-primary p-6 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-accent text-xs font-black uppercase tracking-widest">
                            <Play size={14} fill="currentColor" /> Video Demonstration
                        </div>
                        <video
                            controls
                            className="w-full rounded-lg border border-white/10 shadow-2xl"
                            src={asset.productVideo}
                        />
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="md:col-span-6 lg:col-span-4 space-y-6">
                <div className="space-y-2">
                    <p className="text-sm text-blue-600 hover:underline cursor-pointer">Visit the reSell Mania Verified Store</p>
                    <h1 className="text-3xl font-medium leading-tight">{asset.title}</h1>
                    <div className="flex items-center gap-4 py-2 border-y border-gray-100">
                        <div className="flex items-center text-xs font-bold text-success gap-1 uppercase">
                            <ShieldCheck size={16} /> Custodian Verified
                        </div>
                        <div className="text-xs text-gray-500">Seller: <span className="text-primary font-medium">{asset.seller?.name || 'Authorized Member'}</span></div>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-gray-500 text-sm">Suggested Price</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-light text-primary tracking-tighter">৳{asset.price.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-gray-500">Includes secure escrow fee and custodian verification guarantee.</p>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold">About this asset</h3>
                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{asset.description}</p>
                </div>
            </div>

            {/* Checkout Card */}
            <div className="md:col-span-12 lg:col-span-2 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
                    <div className="text-2xl font-bold mb-4">৳{asset.price.toLocaleString()}</div>
                    <p className="text-xs mb-4 text-success font-bold flex items-center gap-1"><Truck size={14} /> FREE Standard Shipping</p>

                    <button 
                        onClick={() => {
                            if (!user) {
                                navigate('/login');
                            } else {
                                setShowOrderForm(true);
                            }
                        }} 
                        className="premium-button w-full mb-3 py-3 text-sm flex items-center justify-center gap-2"
                    >
                        Order Now
                    </button>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex gap-3 text-[10px] text-gray-500">
                            <Lock size={16} className="shrink-0" />
                            <span><strong>Secure Transaction</strong> - Professional escrow system.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Form Modal */}
            {showOrderForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-primary p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Confirm Order</h2>
                                <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Market Protocol Verification</p>
                            </div>
                            <button onClick={() => setShowOrderForm(false)} className="hover:rotate-90 transition-transform">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleOrder} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="amazon-input text-sm font-bold"
                                        value={shippingInfo.name}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        className="amazon-input text-sm font-bold"
                                        value={shippingInfo.phone}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Location</label>
                                    <textarea
                                        required
                                        rows="2"
                                        className="amazon-input text-sm font-bold resize-none"
                                        value={shippingInfo.location}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, location: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</label>
                                    <select
                                        className="amazon-input text-sm font-bold"
                                        value={shippingInfo.paymentMethod}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, paymentMethod: e.target.value })}
                                    >
                                        <option>Cash on Delivery</option>
                                        <option>Mobile Banking (Bkash/Nagad)</option>
                                        <option>Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-gray-400">Total Payable</span>
                                <span className="text-xl font-black text-primary">৳{asset.price.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={orderLoading}
                                className="w-full bg-accent text-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-accent-hover active:scale-95 transition-all disabled:opacity-50"
                            >
                                {orderLoading ? 'Processing Order...' : 'Confirm Delivery Protocol'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetDetails;
