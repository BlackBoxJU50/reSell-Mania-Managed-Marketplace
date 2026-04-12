const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./server/models/Category');

dotenv.config({ path: './server/.env' });

const categories = [
    { name: 'Electronics', bnName: 'ইলেকট্রনিক্স' },
    { name: 'Fashion & Beauty', bnName: 'ফ্যাশন ও সৌন্দর্য' },
    { name: 'Home & Living', bnName: 'ঘর ও গৃহস্থালি' },
    { name: 'Vehicles', bnName: 'যানবাহন' },
    { name: 'Agriculture', bnName: 'কৃষি' },
    { name: 'Mobiles & Gadgets', bnName: 'মোবাইল ও গ্যাজেট' },
    { name: 'Business & Industrial', bnName: 'ব্যবসা ও শিল্প' },
    { name: 'Services', bnName: 'সেবা' },
    { name: 'Education', bnName: 'শিক্ষা' },
    { name: 'Sports & Outdoors', bnName: 'খেলাধুলা ও আউটডোর' },
    { name: 'Property', bnName: 'সম্পত্তি' },
    { name: 'Health', bnName: 'স্বাস্থ্য' },
    { name: 'Food & Groceries', bnName: 'খাদ্য ও মুদি' },
    { name: 'Others', bnName: 'অন্যান্য' }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/resellmn');
        console.log('Connected to DB');
        
        await Category.deleteMany({});
        console.log('Cleared existing categories');
        
        await Category.insertMany(categories);
        console.log('Seeded new categories');
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
