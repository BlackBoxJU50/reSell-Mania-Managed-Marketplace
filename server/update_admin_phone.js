const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './server/.env' });

const setup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            family: 4,
            tlsAllowInvalidCertificates: true
        });
        console.log('Connected to MongoDB');

        const existingAdmin = await User.findOne({ email: '20210652885khan@juniv.edu' });
        if (existingAdmin) {
            existingAdmin.phone = '01711111111'; // Set the new admin phone number
            await existingAdmin.save();
            console.log('Admin user updated with phone number: 01711111111');
        } else {
            console.log('Admin user not found. Creating one...');
            const adminData = {
                name: 'Hasib Admin',
                email: '20210652885khan@juniv.edu',
                phone: '01711111111',
                password: 'hasibhak@321', // Will be hashed by pre-save hook
                role: 'admin'
            };
            const admin = new User(adminData);
            await admin.save();
            console.log('Admin user created with phone: 01711111111');
        }

        process.exit(0);
    } catch (err) {
        console.error('Setup Error:', err);
        process.exit(1);
    }
};

setup();
