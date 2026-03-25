const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminData = {
            name: 'Hasib Khan',
            email: '20210652885khan@juniv.edu',
            password: 'hasibhak@321', // Will be hashed by pre-save hook
            role: 'admin'
        };

        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin already exists');
        } else {
            const admin = new User(adminData);
            await admin.save();
            console.log('Admin user created successfully');
        }
        process.exit();
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
