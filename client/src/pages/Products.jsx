import React, { useEffect, useState } from 'react';
import api, { getCachedCategories } from '../utils/api';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, ShieldCheck, Eye } from 'lucide-react';
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
    const [selectedCondition, setSelectedCondition] = useState('all');

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
        const matchesCondition = selectedCondition === 'all' || asset.condition === selectedCondition;
        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesCondition;
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
                    <select
                        className="amazon-input font-bold"
                        value={selectedCondition}
                        onChange={(e) => setSelectedCondition(e.target.value)}
                    >
                        <option value="all">Any Condition</option>
                        <option value="New">New Only</option>
                        <option value="Used">Used Only</option>
                    </select>
                    <button 
                        onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setMinPrice(''); setMaxPrice(''); setSelectedCondition('all'); }}
                        className="bg-gray-50 text-gray-400 hover:bg-gray-100 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {loading ? (
                    Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                ) : filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
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
