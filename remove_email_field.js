const path = require('path');
const serverPath = path.join(__dirname, 'server');
const mongoose = require(path.join(serverPath, 'node_modules', 'mongoose'));
const User = require(path.join(serverPath, 'models', 'User'));
require(path.join(serverPath, 'node_modules', 'dotenv')).config({ path: path.join(serverPath, '.env') });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            family: 4,
            tlsAllowInvalidCertificates: true
        });
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Drop the email index if it exists
        try {
            await collection.dropIndex('email_1');
            console.log('Email unique index dropped');
        } catch (err) {
            console.log('Email index not found or already dropped');
        }

        // Unset the email field from all users
        const result = await collection.updateMany({}, { $unset: { email: "" } });
        console.log(`Updated ${result.modifiedCount} users: email field removed.`);

        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
};

migrate();
