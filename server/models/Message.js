const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If null, assumed for Admin
    content: { type: String, required: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }, // Contextual chat for a specific product
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
