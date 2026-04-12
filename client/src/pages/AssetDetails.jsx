import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, Truck, RotateCcw, Lock, DollarSign, Play, X, Phone, MessageSquare } from 'lucide-react';

const AssetDetails = () => {
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [messageDraft, setMessageDraft] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        if (!messageDraft.trim()) return;

        setSendingMessage(true);
        try {
            await api.post('/messages', {
                content: messageDraft,
                assetId: asset._id
            });
            alert('Your message has been transmitted to reSell Mania admins.');
            setShowChatModal(false);
            setMessageDraft('');
        } catch (err) {
            alert('Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const [orderAgreed, setOrderAgreed] = useState(false);

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-accent border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Details...</p>
        </div>
    );
    if (!asset) return (
        <div className="p-20 text-center space-y-4">
            <X size={48} className="mx-auto text-red-100" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Product not found</p>
            <button onClick={() => navigate('/')} className="text-accent font-bold hover:underline">Back to Home</button>
        </div>
    );

    if (orderSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xl space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                    <ShieldCheck size={40} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-primary uppercase tracking-tighter text-success">Order Placed!</h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Verified • Our team will call you soon</p>
                </div>
                <p className="max-w-xs text-center text-sm text-gray-500 font-medium leading-relaxed">
                    Great choice! We have received your order. Our manager will verify the details and contact you for delivery.
                </p>
                <div className="flex gap-4 w-full max-w-xs">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-secondary transition-colors"
                    >
                        My Dashboard
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors"
                    >
                        Keep Shopping
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
                            <Play size={14} fill="currentColor" /> Watch Video Demo
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
                <div className="space-y-4">
                    <span className="text-[10px] font-black bg-success/10 text-success px-3 py-1 rounded-full uppercase tracking-widest border border-success/20">reSell Mania Verified</span>
                    <h1 className="text-4xl font-black text-primary tracking-tighter leading-none">{asset.title}</h1>
                    <div className="flex items-center gap-4 py-2 border-y border-gray-100">
                        <div className="text-xs text-gray-500 font-bold uppercase">Seller: <span className="text-accent font-black tracking-widest">{asset.seller?.name || 'Verified Member'}</span></div>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Price in BDT</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-black text-primary tracking-tighter">৳{asset.price.toLocaleString()}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Secure escrow & Quality Guarantee included.</p>
                </div>

                <div className="space-y-4 bg-gray-50 p-6 rounded-2xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-gray-200 pb-2">Description</h3>
                    <p className="text-sm leading-relaxed text-gray-600 font-medium whitespace-pre-wrap">{asset.description}</p>
                </div>
            </div>

            {/* Checkout Card */}
            <div className="md:col-span-12 lg:col-span-2 space-y-4">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/50 sticky top-24 space-y-6">
                    <div>
                        <div className="text-3xl font-black text-primary tracking-tighter">৳{asset.price.toLocaleString()}</div>
                        <p className="text-[10px] mt-1 text-success font-black uppercase tracking-widest flex items-center gap-1"><Truck size={12} /> Fast Delivery</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <a 
                            href="tel:01706431932"
                            className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-green-200/50 hover:bg-green-700 transition-all active:scale-95"
                        >
                            <Phone size={14} /> Call Now
                        </a>
                        <button 
                            onClick={() => setShowChatModal(true)}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-secondary transition-all active:scale-95"
                        >
                            <MessageSquare size={14} /> Live Chat
                        </button>
                    </div>

                    {user?.role !== 'admin' && asset.status === 'LIVE' && (
                        <button 
                            onClick={() => {
                                if (!user) {
                                    navigate('/login');
                                } else {
                                    setShowOrderForm(true);
                                }
                            }} 
                            className="w-full bg-accent text-primary py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Buy it Now
                        </button>
                    )}

                    <div className="space-y-4 pt-4 border-t border-gray-50">
                        <div className="flex gap-3 text-[9px] text-gray-400 font-black uppercase leading-tight">
                            <Lock size={14} className="shrink-0 text-primary" />
                            <span>Safe Transaction Guarantee</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Form Modal */}
            {showOrderForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-gray-50 p-8 border-b border-gray-100 flex justify-between items-center text-primary">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Delivery Details</h2>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Confirm your order address</p>
                            </div>
                            <button onClick={() => setShowOrderForm(false)} className="text-gray-300 hover:text-primary transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleOrder} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="amazon-input text-sm font-bold bg-gray-50 border-none"
                                        value={shippingInfo.name}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        className="amazon-input text-sm font-bold bg-gray-50 border-none"
                                        value={shippingInfo.phone}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Address</label>
                                    <textarea
                                        required
                                        rows="2"
                                        className="amazon-input text-sm font-bold bg-gray-50 border-none resize-none"
                                        value={shippingInfo.location}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, location: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</label>
                                    <select
                                        className="amazon-input text-sm font-bold bg-gray-50 border-none appearance-none"
                                        value={shippingInfo.paymentMethod}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, paymentMethod: e.target.value })}
                                    >
                                        <option>Cash on Delivery</option>
                                        <option>Bkash / Nagad</option>
                                        <option>Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-primary/5 p-4 rounded-2xl flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-gray-400">Total Price</span>
                                <span className="text-xl font-black text-primary tracking-tighter">৳{asset.price.toLocaleString()}</span>
                            </div>

                            <div className="space-y-4 pt-2">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        required 
                                        className="mt-1 w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent"
                                        checked={orderAgreed}
                                        onChange={(e) => setOrderAgreed(e.target.checked)}
                                    />
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-primary transition-colors leading-tight">
                                        I agree to reSell Mania's Purchase & Verification Policy. I understand that a manager will verify the item before delivery.
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={orderLoading || !orderAgreed}
                                    className="w-full bg-accent text-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-accent/20 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {orderLoading ? 'Processing...' : 'Confirm My Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showChatModal && (
                <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-end md:items-center justify-center p-4">
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        <header className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-primary tracking-tighter uppercase">Direct Support Channel</h3>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Inquiring about: {asset.title}</p>
                            </div>
                            <button onClick={() => setShowChatModal(false)} className="text-gray-400 hover:text-primary"><X size={24} /></button>
                        </header>
                        <form onSubmit={handleSendMessage} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transmission Payload</label>
                                <textarea 
                                    className="w-full bg-gray-50 border-none rounded-2xl p-6 font-bold text-sm resize-none h-40 focus:ring-2 focus:ring-primary placeholder:text-gray-300"
                                    placeholder="Write your message to the admin team here..."
                                    value={messageDraft}
                                    onChange={(e) => setMessageDraft(e.target.value)}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={sendingMessage}
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {sendingMessage ? 'Transmitting...' : <><MessageSquare size={16} /> Broadcast Message</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AssetDetails;
