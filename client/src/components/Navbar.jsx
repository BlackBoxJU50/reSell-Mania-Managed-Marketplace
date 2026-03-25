import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Globe } from 'lucide-react';
import api, { getCachedCategories } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
    const { language, toggleLanguage, t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
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
    const [searchQuery, setSearchQuery] = useState('');
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

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/all?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsMenuOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('user-login'));
        setIsMenuOpen(false);
        navigate('/login');
    };

    return (
        <nav className="bg-primary text-white sticky top-0 z-50">
            <div className="container mx-auto px-4">
                {/* Top Bar */}
                <div className="flex items-center justify-between py-2 gap-4">
                    <Link to="/" className="text-2xl font-black text-accent shrink-0 tracking-tighter">
                        reSell Mania
                    </Link>

                    {/* Desktop Search - Hidden for Manager */}
                    {!isAdmin && !isAuthPage && (
                        <form onSubmit={handleSearch} className="flex-grow max-w-2xl hidden md:flex">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder={t('nav.searchPlaceholder')}
                                    className="w-full py-2 px-4 pr-12 rounded text-primary focus:outline-none text-sm font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-0 h-full px-4 bg-accent rounded-r text-primary hover:bg-accent-hover transition-colors flex items-center justify-center"
                                >
                                    {isSearching ? (
                                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                    ) : (
                                        <Search size={18} />
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-gray-700 transition-colors border border-gray-600"
                        >
                            <Globe size={16} className="text-accent" />
                            <span className="text-xs font-black uppercase tracking-widest">{language === 'en' ? 'BN' : 'EN'}</span>
                        </button>

                        <div className="hidden md:flex items-center gap-6">
                            {!isAdmin && (
                                <Link to="/sell" className="text-sm font-bold hover:text-accent transition-colors">
                                    Sell your product
                                </Link>
                            )}

                            {user && (
                                <Link to={isAdmin ? "/" : "/dashboard"} className="text-sm font-bold hover:text-accent transition-colors">
                                    {isAdmin ? "Manager Panel" : t('nav.dashboard')}
                                </Link>
                            )}

                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 border border-red-900/50 px-3 py-1 rounded bg-red-900/10 transition-colors"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link to="/login" className="flex items-center gap-1 hover:text-accent transition-colors">
                                    <User size={20} />
                                    <span className="text-sm font-bold">{t('nav.account')}</span>
                                </Link>
                            )}

                            {!isAdmin && (
                                <Link to="/cart" className="flex items-center gap-1 hover:text-accent transition-colors">
                                    <ShoppingCart size={20} />
                                    <span className="text-sm font-bold">{t('nav.cart')}</span>
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

                {/* Mobile Search Bar - Hidden for Manager */}
                {!isAdmin && !isAuthPage && (
                    <div className="md:hidden pb-3">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                placeholder={t('nav.searchPlaceholder')}
                                className="w-full py-2 px-4 pr-10 rounded text-primary focus:outline-none text-xs font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-0 h-full px-3 bg-accent rounded-r text-primary flex items-center justify-center"
                            >
                                <Search size={16} />
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Mobile Sidebar/Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-secondary border-t border-gray-700 py-4 animate-in slide-in-from-top duration-300">
                    <div className="container mx-auto px-4 flex flex-col gap-4 font-bold uppercase text-xs tracking-widest">
                        {!isAdmin && (
                            <Link to="/sell" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-gray-700 flex justify-between items-center text-accent">
                                Sell your product <span>→</span>
                            </Link>
                        )}
                        {user && (
                            <Link to={isAdmin ? "/" : "/dashboard"} onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-gray-700 flex justify-between items-center">
                                {isAdmin ? "Manager Panel" : t('nav.dashboard')} <span>→</span>
                            </Link>
                        )}
                        {!user && (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-gray-700 flex justify-between items-center">
                                {t('nav.account')} <span>→</span>
                            </Link>
                        )}
                        {!isAdmin && (
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-gray-700 flex justify-between items-center">
                                {t('nav.cart')} <span>→</span>
                            </Link>
                        )}
                        {user && (
                            <button onClick={handleLogout} className="py-2 text-red-400 text-left font-black tracking-[0.2em]">
                                DISCONNECT PROTOCOL (LOGOUT)
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Category Bar (Desktop) - COMPLETELY HIDDEN FOR MANAGER */}
            {!isAdmin && !isAuthPage && (
                <div className="bg-secondary text-[13px] font-black uppercase tracking-widest py-3 overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-gray-700 hidden md:block">
                    <div className="container mx-auto px-4 flex gap-10">
                        <Link to="/all" className="flex items-center gap-1.5 text-accent">
                            <Menu size={16} /> {t('nav.categories.all')}
                        </Link>
                        {categories.map(cat => (
                            <Link 
                                key={cat._id} 
                                to={`/all?category=${cat.name}`} 
                                className="hover:text-accent cursor-pointer transition-colors"
                            >
                                {language === 'bn' ? cat.bnName : cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
