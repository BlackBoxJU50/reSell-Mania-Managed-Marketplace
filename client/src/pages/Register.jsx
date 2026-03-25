import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';

const Register = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/register', {
                name,
                phone,
                password,
                role: 'participant'
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.dispatchEvent(new Event('user-login'));
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl space-y-8"
            >
                <header className="space-y-2 border-b border-gray-50 pb-6 text-center">
                    <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Join Us!</h1>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest">Create your account in seconds</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Adel Ahamed"
                            className="amazon-input bg-gray-50 border-none font-bold placeholder:text-gray-300 py-4 px-6 rounded-2xl"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                        <input
                            required
                            type="tel"
                            placeholder="e.g. 01700000000"
                            className="amazon-input bg-gray-50 border-none font-bold placeholder:text-gray-300 py-4 px-6 rounded-2xl"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Create Password (6+ Chars)</label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            minLength={6}
                            className="amazon-input bg-gray-50 border-none font-bold placeholder:text-gray-300 py-4 px-6 rounded-2xl"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-primary py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-lg hover:bg-accent-hover active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Joining...' : 'Create My Account'}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-[10px] text-gray-400 font-bold hover:text-accent uppercase tracking-widest transition-colors">
                            Already have an account? <span className="text-primary underline">Sign in</span>
                        </Link>
                    </div>

                    <p className="text-[9px] text-gray-400 text-center font-bold uppercase leading-relaxed px-8 border-t border-gray-50 pt-6">
                        Start selling your unused products and find great deals today!
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
