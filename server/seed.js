const mongoose = require('mongoose');
const User = require('./models/User');
const Asset = require('./models/Asset');
const Category = require('./models/Category');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const categories = [
    { name: 'Electronics', bnName: 'ইলেকট্রনিক্স' },
    { name: 'Mens Wear', bnName: 'ছেলেদের পোশাক' },
    { name: 'Womens Wear', bnName: 'মেয়েদের পোশাক' },
    { name: 'Furniture', bnName: 'আসবাবপত্র' },
    { name: 'Craft', bnName: 'হস্তশিল্প' },
    { name: 'Agriculture', bnName: 'কৃষি' }
];

const dummyProducts = [
    {
        title: 'MacBook Pro 14" M2 Max',
        description: 'Elite performance laptop for creative professionals.',
        category: 'Electronics',
        price: 2499,
        status: 'LIVE'
    },
    {
        title: 'Premium Panjabi - Royal Blue',
        description: 'Traditional wedding wear with intricate embroidery.',
        category: 'Mens Wear',
        price: 45,
        status: 'LIVE'
    },
    {
        title: 'Silk Saree - Jamdani Style',
        description: 'Authentic hand-woven silk saree from Tangail.',
        category: 'Womens Wear',
        price: 80,
        status: 'LIVE'
    },
    {
        title: 'Teak Wood Dining Table',
        description: 'Classic 6-seater solid wood table.',
        category: 'Furniture',
        price: 650,
        status: 'LIVE'
    },
    {
        title: 'Handcrafted Bamboo Basket Set',
        description: 'Eco-friendly home decor set of 3.',
        category: 'Craft',
        price: 25,
        status: 'LIVE'
    },
    {
        title: 'Organic Tea Leaves (500g)',
        description: 'Fresh from the gardens of Sylhet.',
        category: 'Agriculture',
        price: 15,
        status: 'LIVE'
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { family: 4, tlsAllowInvalidCertificates: true });
        console.log('Seed: Connected to MongoDB');

        // Clear existing data (Optional, be careful)
        // await Category.deleteMany({});
        // await Asset.deleteMany({});

        // Seed Categories
        for (const cat of categories) {
            await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true });
        }
        console.log('Seed: Categories synced');

        // Find an admin or first user to be the seller
        const admin = await User.findOne({ role: 'admin' }) || await User.findOne();
        if (!admin) {
            console.log('Seed Error: Create at least one user first!');
            process.exit(1);
        }

        // Seed Products
        for (const prod of dummyProducts) {
            await Asset.create({ ...prod, seller: admin._id });
        }
        console.log('Seed: Dummy products created');

        process.exit();
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seed();
