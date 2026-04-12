require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function dropIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const User = require('./server/models/User');
        await User.collection.dropIndex('email_1');
        console.log('Index dropped successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error dropping index:', err);
        process.exit(1);
    }
}
dropIndex();
