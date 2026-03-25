import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    const { t, language } = useLanguage();

    return (
        <footer className="bg-primary text-white pt-16 pb-8 mt-20 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="text-2xl font-black text-accent tracking-tighter">
                            reSell Mania
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {language === 'en'
                                ? "The most trusted platform for verified product exchange in Bangladesh. Managed, secure, and transparent."
                                : "বাংলাদেশের সবচেয়ে বিশ্বস্ত এবং যাচাইকৃত পণ্য কেনাবেচার মাধ্যম। নিরাপদ এবং স্বচ্ছ।"
                            }
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-secondary rounded-lg hover:text-accent transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="p-2 bg-secondary rounded-lg hover:text-accent transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="p-2 bg-secondary rounded-lg hover:text-accent transition-colors"><Instagram size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent">Navigation</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-400">
                            <li><Link to="/" className="hover:text-white transition-colors">{t('nav.all')}</Link></li>
                            <li><Link to="/sell" className="hover:text-white transition-colors">{t('nav.sell')}</Link></li>
                            <li><Link to="/dashboard" className="hover:text-white transition-colors">{t('nav.dashboard')}</Link></li>
                            <li><Link to="/login" className="hover:text-white transition-colors">{t('nav.account')}</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent">Categories</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">{t('nav.categories.electronics')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('nav.categories.mensWear')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('nav.categories.womensWear')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('nav.categories.agriculture')}</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent">Support</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-400">
                            <li className="flex items-center gap-3"><Mail size={16} className="text-accent" /> support@resellmania.com</li>
                            <li className="flex items-center gap-3"><Phone size={16} className="text-accent" /> +880 1234 567890</li>
                            <li className="flex items-center gap-3"><MapPin size={16} className="text-accent" /> Dhaka, Bangladesh</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <p>© 2024 RE-SELL MANIA. ALL PROTOCOLS RESERVED.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
