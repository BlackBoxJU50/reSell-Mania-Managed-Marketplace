const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
require('dotenv').config();

const categories = [
    { name: 'Electronics', bnName: 'ইলেকট্রনিক্স' },
    { name: 'Mens Wear', bnName: 'ছেলেদের পোশাক' },
    { name: 'Womens Wear', bnName: 'মেয়েদের পোশাক' },
    { name: 'Furniture', bnName: 'আসবাবপত্র' },
    { name: 'Craft', bnName: 'হস্তশিল্প' },
    { name: 'Agriculture', bnName: 'কৃষি' }
];

const setup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            family: 4,
            tlsAllowInvalidCertificates: true
        });
        console.log('Connected to MongoDB');

        // Upsert Admin
        const adminData = {
            name: 'Hasib Admin',
            phone: '01711111111',
            password: 'hasibhak@321', // Will be hashed by pre-save hook
            role: 'admin'
        };

        const existingAdmin = await User.findOne({ phone: adminData.phone });
        if (existingAdmin) {
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('Admin user updated');
        } else {
            const admin = new User(adminData);
            await admin.save();
            console.log('Admin user created');
        }

        // Seed Categories
        for (const cat of categories) {
            await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true });
        }
        console.log('Categories seeded');

        process.exit(0);
    } catch (err) {
        console.error('Setup Error:', err);
        process.exit(1);
    }
};

setup();
