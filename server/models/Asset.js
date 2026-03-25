const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    categoryData: { type: mongoose.Schema.Types.Mixed }, // JSON for specific category requirements
    legalityImages: [{ type: String }], // Invoices, Deeds, Certificates
    productImages: [{ type: String }], // Array of image URLs
    productVideo: { type: String }, // Single video URL
    price: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING_VERIFICATION', 'LIVE', 'SOLD', 'DELIVERED'],
        default: 'PENDING_VERIFICATION'
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Asset', assetSchema);
