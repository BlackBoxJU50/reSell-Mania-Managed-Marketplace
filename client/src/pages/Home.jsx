import React, { useEffect, useState } from 'react';
import api, { getCachedCategories } from '../utils/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ProductCardSkeleton } from '../components/Skeleton';

const Home = () => {
    const { t, language } = useLanguage();
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetsRes, catsData] = await Promise.all([
                    api.get('/assets'),
                    getCachedCategories()
                ]);
                setAssets(assetsRes.data);
                setCategories(catsData);
            } catch (err) {
                console.error('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="p-24 text-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <p className="font-black text-gray-300 uppercase tracking-widest text-xs">{t('home.loading')}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-12">
            {/* Hero / Banner */}
            <section className="relative bg-secondary text-white rounded-2xl p-6 md:p-12 overflow-hidden">
                <div className="relative z-10 max-w-xl space-y-6">
                    <span className="bg-accent text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider italic">Direct Manager-Managed Marketplace</span>
                    <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">{t('home.heroTitle')}</h1>
                    <p className="text-sm md:text-lg opacity-80 font-medium">{t('home.heroSub')}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/sell" className="premium-button text-center">Sell Product</Link>
                        <Link to="/all" className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg transition-colors font-bold text-sm border border-white/20 uppercase tracking-widest text-center">
                            Explore Product
                        </Link>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-accent/20 to-transparent blur-3xl hidden md:block"></div>
            </section>

            {/* Featured Categories - Dynamic */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {(categories.length > 0 ? categories : [
                    { name: 'Latest Tech', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop' },
                    { name: 'Clothing', img: 'https://images.unsplash.com/photo-1534438327271-147b9e784752?w=200&h=200&fit=crop' },
                    { name: 'Home Goods', img: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=200&h=200&fit=crop' }
                ]).map((cat, i) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={i}
                        className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-50 flex items-center justify-center text-accent border-2 border-accent/20">
                            <Star size={24} />
                        </div>
                        <span className="font-black text-[11px] md:text-sm uppercase tracking-tight text-primary text-center">
                            {language === 'bn' ? cat.bnName : cat.name}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Product Grid */}
            <section className="space-y-6 px-2 md:px-0">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-xl md:text-2xl font-black text-primary flex items-center gap-2">
                        <Zap className="text-accent" fill="currentColor" /> Live Products
                    </h2>
                    <Link to="/all" className="bg-accent text-primary px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">View All Products</Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {loading ? (
                        Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                    ) : (
                        assets.map((asset) => (
                            <motion.div
                                key={asset._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white group cursor-pointer flex flex-col h-full rounded-xl overflow-hidden hover:shadow-2xl transition-all border border-gray-100"
                            >
                                <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                                    <img
                                        src={'https://placehold.co/400x300?text=' + encodeURIComponent(asset.title)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 font-bold"
                                        alt={asset.title}
                                    />
                                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-black flex items-center gap-1 shadow-sm uppercase tracking-widest text-success border border-success/20">
                                        <ShieldCheck size={10} /> Verified
                                    </div>
                                </div>
                                <div className="p-4 space-y-2 flex-grow flex flex-col">
                                    <p className="text-[10px] text-accent font-black uppercase tracking-widest">{asset.category}</p>
                                    <h3 className="font-extrabold text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-accent transition-colors">{asset.title}</h3>
                                    <div className="flex items-center gap-1 overflow-hidden">
                                        <div className="flex text-accent">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                                        </div>
                                        <span className="text-[9px] text-gray-400 font-bold">(Managed Transaction)</span>
                                    </div>
                                    <div className="pt-3 mt-auto">
                                        <p className="text-xl font-black text-primary flex items-start gap-0.5">
                                            <span className="text-xs font-bold mt-1 tracking-tighter">৳</span>
                                            {asset.price.toLocaleString()}
                                        </p>
                                        <Link to={`/asset/${asset._id}`} className="block w-full text-center py-2.5 mt-4 bg-accent text-primary rounded text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform active:scale-95">
                                            View Product
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
