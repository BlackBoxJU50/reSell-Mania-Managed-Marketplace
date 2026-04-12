import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Globe } from 'lucide-react';
import api, { getCachedCategories } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);

    useEffect(() => {
        const syncUser = () => {
            try {
                const userJson = localStorage.getItem('user');
                if (userJson) {
                    setUser(JSON.parse(userJson));
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            }
        };

        syncUser();
        window.addEventListener('storage', syncUser);
        window.addEventListener('user-login', syncUser);

        return () => {
            window.removeEventListener('storage', syncUser);
            window.removeEventListener('user-login', syncUser);
        };
    }, []);

    const isAdmin = user?.role === 'admin';
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCachedCategories();
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch categories in Navbar");
            }
        };
        fetchCategories();
    }, []);

    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.setItem('user', JSON.stringify({}));
        window.dispatchEvent(new Event('user-login'));
        setIsMenuOpen(false);
        navigate('/login');
    };

    return (
        <nav className="bg-[#0F172A] text-white sticky top-0 z-50 border-b border-white/5">
            <div className="container mx-auto px-6">
                {/* Top Bar */}
                <div className="flex items-center justify-between py-4 gap-4">
                    <Link to="/" className="text-2xl font-black text-accent shrink-0 tracking-tighter flex items-center gap-2">
                        reSell<span className="text-white">MANIA</span>
                    </Link>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-8">
                            {!isAdmin && (
                                <Link to="/sell" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-accent transition-colors">
                                    Sell Product
                                </Link>
                            )}

                            {user?.phone && (
                                <Link to={isAdmin ? "/" : "/dashboard"} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-accent transition-colors">
                                    {isAdmin ? "Manager Terminal" : "My Dashboard"}
                                </Link>
                            )}

                            {user?.phone ? (
                                <button
                                    onClick={handleLogout}
                                    className="text-[11px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 border border-red-500/20 px-4 py-2 rounded-xl bg-red-500/5 transition-all"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link to="/login" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-accent hover:text-white transition-all">
                                    <User size={16} />
                                    <span>Account Access</span>
                                </Link>
                            )}

                            {!isAdmin && (
                                <Link to="/cart" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">
                                    <ShoppingCart size={18} />
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-accent"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar/Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#0F172A] border-t border-white/5 py-8 animate-in slide-in-from-top duration-300">
                    <div className="container mx-auto px-6 flex flex-col gap-6 font-black uppercase text-[10px] tracking-widest">
                        {!isAdmin && (
                            <Link to="/sell" onClick={() => setIsMenuOpen(false)} className="py-2 flex justify-between items-center text-accent">
                                Sell Product <span>→</span>
                            </Link>
                        )}
                        {user?.phone && (
                            <Link to={isAdmin ? "/" : "/dashboard"} onClick={() => setIsMenuOpen(false)} className="py-2 flex justify-between items-center text-white">
                                {isAdmin ? "Manager Terminal" : "My Dashboard"} <span>→</span>
                            </Link>
                        )}
                        {!user?.phone && (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="py-2 flex justify-between items-center text-white">
                                Account Access <span>→</span>
                            </Link>
                        )}
                        {!isAdmin && (
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="py-2 flex justify-between items-center text-white">
                                My Cart <span>→</span>
                            </Link>
                        )}
                        {user?.phone && (
                            <button onClick={handleLogout} className="py-6 text-red-500 text-left font-black tracking-[0.3em] border-t border-white/5 w-full mt-4">
                                LOGOUT
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Category Bar (Desktop) - COMPLETELY HIDDEN FOR MANAGER */}
            {!isAdmin && !isAuthPage && (
                <div className="bg-[#1E293B] text-[10px] font-black uppercase tracking-widest py-3 overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-white/5 hidden md:block">
                    <div className="container mx-auto px-6 flex items-center gap-10">
                        <Link to="/all" className="flex items-center gap-2 text-accent bg-accent/10 px-3 py-1.5 rounded-lg">
                            <Menu size={14} /> Catalog
                        </Link>
                        {categories.map(cat => (
                            <Link
                                key={cat._id}
                                to={`/all?category=${cat.name}`}
                                className="text-gray-400 hover:text-white cursor-pointer transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
