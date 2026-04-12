const mongoose = require('mongoose');
const User = require('./models/User');
const Asset = require('./models/Asset');
const Category = require('./models/Category');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const categories = [
    // Electronics
    { name: 'Mobiles', bnName: 'মোবাইল' },
    { name: 'Laptops & Computers', bnName: 'ল্যাপটপ ও কম্পিউটার' },
    { name: 'Cameras & Gadgets', bnName: 'ক্যামেরা ও গ্যাজেট' },
    { name: 'Audio & Entertainment', bnName: 'অডিও ও বিনোদন' },
    // Fashion
    { name: 'Mens Fashion', bnName: 'ছেলের পোশাক' },
    { name: 'Womens Fashion', bnName: 'মেয়েদের পোশাক' },
    { name: 'Watches & Accessories', bnName: 'ঘড়ি ও অ্যাক্সেসরিজ' },
    // Home & Living
    { name: 'Furniture', bnName: 'আসবাবপত্র' },
    { name: 'Home Appliances', bnName: 'গৃহ সরঞ্জাম' },
    { name: 'Kitchenware', bnName: 'রান্নাঘরের সরঞ্জাম' },
    // Lifestyle
    { name: 'Books & Stationery', bnName: 'বই ও স্টেশনারি' },
    { name: 'Musical Instruments', bnName: 'বাদ্যযন্ত্র' },
    { name: 'Sports & Fitness', bnName: 'খেলাধুলা ও ফিটনেস' },
    { name: 'Toys & Games', bnName: 'খেলনা ও গেম' },
    // Vehicles
    { name: 'Vehicles & Parts', bnName: 'যানবাহন ও যন্ত্রাংশ' },
    // Business & Industry
    { name: 'Industrial Tools', bnName: 'শিল্প কারখানা সরঞ্জাম' },
    // Agriculture
    { name: 'Agriculture', bnName: 'কৃষি' },
    // Others
    { name: 'Others', bnName: 'অন্যান্য' }
];

const dummyProducts = [
    {
        title: 'iPhone 15 Pro Max - 256GB',
        description: 'Brand new, sealed pack. Titanium Blue color.',
        category: 'Mobiles',
        price: 145000,
        condition: 'New',
        status: 'LIVE'
    },
    {
        title: 'MacBook Air M2 Chip',
        description: 'Used for 2 months, 100% battery health. Midnight color.',
        category: 'Laptops & Computers',
        price: 115000,
        condition: 'Used',
        status: 'LIVE'
    },
    {
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Brand new, noise canceling flagship headphones.',
        category: 'Audio & Entertainment',
        price: 38000,
        condition: 'New',
        status: 'LIVE'
    },
    {
        title: 'Teak Wood King Sized Bed',
        description: 'Solid teak wood, 5 years warranty remains. Excellent condition.',
        category: 'Furniture',
        price: 45000,
        condition: 'Used',
        status: 'LIVE'
    },
    {
        title: 'Organic Honey (500g)',
        description: 'Pure forest honey from Sundarbans.',
        category: 'Agriculture',
        price: 850,
        condition: 'New',
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
