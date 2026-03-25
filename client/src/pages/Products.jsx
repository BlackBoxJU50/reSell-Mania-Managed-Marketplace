import React, { useEffect, useState } from 'react';
import api, { getCachedCategories } from '../utils/api';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ProductCardSkeleton } from '../components/Skeleton';

const Products = () => {
    const { t, language } = useLanguage();
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || 'all';

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Sync state when URL params change (e.g. clicking category nav)
    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '');
        setSelectedCategory(searchParams.get('category') || 'all');
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetsRes, cats] = await Promise.all([
                    api.get('/assets'),
                    getCachedCategories()
                ]);
                setAssets(assetsRes.data);
                setCategories(cats);
            } catch (err) {
                console.error('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
        const matchesMinPrice = minPrice === '' || asset.price >= Number(minPrice);
        const matchesMaxPrice = maxPrice === '' || asset.price <= Number(maxPrice);
        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });

    return (
        <div className="space-y-8">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">Find Your Deal</h1>
                    <p className="text-gray-400 text-[10px] font-black mt-1 uppercase tracking-[0.2em]">All Verified Products</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow max-w-5xl">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            className="amazon-input pr-10 font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                    <select
                        className="amazon-input font-bold"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>
                                {language === 'bn' ? cat.bnName : cat.name}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min Price"
                            className="amazon-input font-bold w-1/2 text-xs"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            className="amazon-input font-bold w-1/2 text-xs"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setMinPrice(''); setMaxPrice(''); }}
                        className="bg-gray-50 text-gray-400 hover:bg-gray-100 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {loading ? (
                    Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                ) : filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
                        <motion.div
                            key={asset._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white group cursor-pointer flex flex-col h-full rounded-xl overflow-hidden hover:shadow-2xl transition-all border border-gray-100"
                        >
                            <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                                <img
                                    src={asset.productImages?.[0] || 'https://placehold.co/400x300?text=' + encodeURIComponent(asset.title)}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 font-bold"
                                    alt={asset.title}
                                />
                                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-black flex items-center gap-1 shadow-sm uppercase tracking-widest text-success border border-success/20">
                                    <ShieldCheck size={10} /> Verified
                                </div>
                            </div>
                            <div className="p-4 space-y-2 flex-grow flex flex-col font-medium">
                                <h3 className="font-black text-primary group-hover:text-accent transition-colors line-clamp-1">{asset.title}</h3>
                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded uppercase">{asset.category}</span>
                                    <span className="text-gray-300">ID: {asset._id.slice(-6)}</span>
                                </div>
                                <div className="pt-3 mt-auto flex justify-between items-end">
                                    <p className="text-xl font-black text-primary flex items-start gap-0.5">
                                        <span className="text-xs font-bold mt-1 tracking-tighter text-gray-400">৳</span>
                                        {asset.price.toLocaleString()}
                                    </p>
                                    <Link to={`/asset/${asset._id}`} className="bg-primary text-accent px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-primary transition-all">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Filter className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No assets match your search parameters</p>
                        <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="mt-4 text-accent text-xs font-bold hover:underline">Clear Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
