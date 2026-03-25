import React, { useState, useEffect } from 'react';
import api, { getCachedCategories } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const LiquidationForm = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: 'Used',
        productImages: [],
        productVideo: ''
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCats = async () => {
            const data = await getCachedCategories();
            setCategories(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, category: data[0].name }));
            }
        };
        fetchCats();
    }, []);

    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploading(true);

        try {
            let images = [];
            let video = '';

            if (selectedImages.length > 0 || selectedVideo) {
                const mediaData = new FormData();
                selectedImages.forEach(img => mediaData.append('images', img));
                if (selectedVideo) mediaData.append('video', selectedVideo);

                const uploadRes = await api.post('/upload/media', mediaData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                images = uploadRes.data.images;
                video = uploadRes.data.video;
            }

            await api.post('/assets', {
                ...formData,
                productImages: images,
                productVideo: video
            });

            setSubmitSuccess(true);
        } catch (err) {
            console.error('Submission error:', err);
            alert(err.response?.data?.message || 'Submission failed. Check network stability.');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4">
                <div className="bg-white rounded-3xl border border-gray-100 p-12 shadow-xl space-y-8 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-primary animate-pulse">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-primary uppercase tracking-tighter">Asset Registered</h2>
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Formal Verification Protocol Initiated</p>
                    </div>
                    <p className="text-gray-500 font-medium leading-relaxed max-w-sm">
                        Your product has been submitted to the Manager queue for audit. You will be notified once the verification is complete.
                    </p>
                    <div className="flex gap-4 w-full">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary transition-colors"
                        >
                            Monitor Status
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-colors"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl space-y-8">
                <header className="space-y-2 border-b border-gray-50 pb-6">
                    <h1 className="text-3xl font-black text-primary tracking-tighter">{t('form.title')}</h1>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest">Formal Verification Protocol Required</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('form.labels.name')}</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. MacBook Pro 2023 M2 Max"
                            className="amazon-input bg-gray-50 border-none font-bold placeholder:text-gray-300 py-4 px-6 rounded-2xl"
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('form.labels.price')}</label>
                            <input
                                required
                                type="number"
                                placeholder="0.00"
                                className="amazon-input bg-gray-50 border-none font-bold py-4 px-6 rounded-2xl"
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('form.labels.category')}</label>
                            <select
                                className="amazon-input bg-gray-50 border-none font-bold py-4 px-6 rounded-2xl appearance-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat.name}>
                                        {t(`nav.categories.${cat.name.toLowerCase().replace(' ', '')}`) || cat.name}
                                    </option>
                                ))}
                                {categories.length === 0 && (
                                    <>
                                        <option value="Electronics">{t('nav.categories.electronics')}</option>
                                        <option value="Mens Wear">{t('nav.categories.mensWear')}</option>
                                        <option value="Womens Wear">{t('nav.categories.womensWear')}</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('form.labels.description')}</label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Detail everything. Transparency is required for Manager approval..."
                            className="amazon-input bg-gray-50 border-none font-bold py-4 px-6 rounded-2xl resize-none"
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Images (Up to 5)</label>
                            <div className="flex flex-wrap gap-2">
                                <label className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                                    <span className="text-xl text-gray-400">+</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setSelectedImages(Array.from(e.target.files).slice(0, 5))}
                                    />
                                </label>
                                {selectedImages.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-accent">{selectedImages.length} Ready</span>
                                        <button type="button" onClick={() => setSelectedImages([])} className="text-[10px] text-red-500 font-bold underline">Clear</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Video Demo (Short)</label>
                            <div className="flex items-center gap-4">
                                <label className="flex-1 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {selectedVideo ? selectedVideo.name.slice(0, 15) + '...' : 'Click to Upload Video'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={(e) => setSelectedVideo(e.target.files[0])}
                                    />
                                </label>
                                {selectedVideo && (
                                    <button type="button" onClick={() => setSelectedVideo(null)} className="text-[10px] text-red-500 font-bold underline">Remove</button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary p-6 rounded-2xl text-white space-y-4">
                        <div className="flex justify-between items-center text-xs border-b border-white/10 pb-4">
                            <span className="font-bold opacity-60">Platform Protocol Fee</span>
                            <span className="font-black text-accent">-10%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black uppercase tracking-widest italic">Net Result</span>
                            <span className="text-xl font-black text-accent">৳ {(formData.price * 0.9).toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-accent text-primary py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-lg hover:bg-accent-hover active:scale-95 transition-all disabled:opacity-50"
                    >
                        {uploading ? 'Processing Media Vault...' : loading ? 'Transmitting Data...' : t('form.submit')}
                    </button>

                    <p className="text-[9px] text-gray-400 text-center font-bold uppercase leading-relaxed px-12">
                        By submitting, you agree to the Manager's right to audit all legal documentation associated with this product.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LiquidationForm;
