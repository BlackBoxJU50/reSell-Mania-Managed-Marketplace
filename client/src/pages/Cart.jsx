import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ShoppingBag } from 'lucide-react';

const Cart = () => {
    // For now, let's assume the cart is empty as requested
    const cartItems = [];

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/all" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Your Vault (Cart)</h1>
            </div>

            {cartItems.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-6 shadow-sm">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <ShoppingBag size={48} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-primary mb-2">Nothing is selected</h2>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                            Your acquisition queue is currently empty. Explore the marketplace to find verified assets.
                        </p>
                    </div>
                    <Link 
                        to="/all" 
                        className="inline-block bg-accent text-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-accent/20 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        Explore Marketplace
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Future cart implementation will go here */}
                    <p className="text-center text-gray-400 uppercase text-xs font-black tracking-widest">Cart entries detected</p>
                </div>
            )}
        </div>
    );
};

export default Cart;
