import React, { useEffect, useState } from 'react';
import api, { getCachedCategories } from '../utils/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Zap, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ProductCardSkeleton } from '../components/Skeleton';

const Home = () => {
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
                <p className="font-black text-gray-300 uppercase tracking-widest text-[10px]">Loading Exchange...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-12">
            {/* Hero / Banner */}
            <section className="relative bg-[#0F172A] text-white rounded-[32px] p-8 md:p-16 overflow-hidden border border-white/5 shadow-2xl">
                <div className="relative z-10 max-w-2xl space-y-8">
                    <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20">Protocol Managed Marketplace</span>
                    <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">THE FUTURE OF <span className="text-accent underline decoration-4 underline-offset-8">ASSET</span> EXCHANGE.</h1>
                    <p className="text-sm md:text-lg opacity-60 font-medium leading-relaxed">Experience a direct, manager-moderated marketplace designed for the Bangladeshi market. No complexity, just verified quality.</p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link to="/sell" className="bg-accent text-primary px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20">Sell Product</Link>
                        <Link to="/all" className="bg-white/5 hover:bg-white/10 px-10 py-4 rounded-2xl transition-all font-black text-xs border border-white/10 uppercase tracking-widest text-center backdrop-blur-md">
                            Explore Catalog
                        </Link>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent blur-[120px] hidden md:block"></div>
            </section>

            {/* Product Grid */}
            <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-2xl font-black text-primary uppercase tracking-tighter flex items-center gap-3">
                            <Zap className="text-accent" fill="currentColor" size={24} /> Live Products
                        </h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Direct from verified protocol participants</p>
                    </div>
                    <Link to="/all" className="bg-accent text-primary px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg shadow-accent/10">View Full Catalog</Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {loading ? (
                        Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                    ) : (
                        assets.map((asset) => (
                            <Link
                                key={asset._id}
                                to={`/asset/${asset._id}`}
                                className="bg-white group cursor-pointer flex flex-col h-full rounded-lg overflow-hidden transition-all border border-gray-100 hover:border-accent hover:shadow-xl relative"
                            >
                                <div className="aspect-square relative overflow-hidden bg-gray-50">
                                    <img
                                        src={asset.productImages?.[0] || 'https://placehold.co/300x300?text=' + encodeURIComponent(asset.title)}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 font-bold"
                                        alt={asset.title}
                                    />
                                    <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[7px] font-black flex items-center gap-0.5 shadow-sm uppercase tracking-tighter text-primary border border-gray-100">
                                        <Eye size={8} /> {asset.views || 0}
                                    </div>
                                    <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[7px] font-black shadow-sm uppercase tracking-tighter text-success border border-success/20">
                                        Verified
                                    </div>
                                </div>
                                <div className="p-3 space-y-1 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-black text-[11px] text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight uppercase tracking-tight">{asset.title}</h3>
                                        <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{asset.category}</p>
                                    </div>
                                    <div className="pt-2 flex justify-between items-baseline">
                                        <p className="text-sm font-black text-primary flex items-start">
                                            <span className="text-[8px] font-bold mt-0.5 mr-0.5 text-gray-400">৳</span>
                                            {asset.price.toLocaleString()}
                                        </p>
                                        <span className="text-[7px] font-black text-accent opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Detail →</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
