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
    serviceFee: { type: Number, default: 0 }, // Platform commission in BDT
    condition: { type: String, enum: ['New', 'Used'], default: 'Used' },
    status: {
        type: String,
        enum: ['PENDING_VERIFICATION', 'LIVE', 'SOLD', 'DELIVERED', 'REJECTED'],
        default: 'PENDING_VERIFICATION'
    },
    rejectionReason: { type: String },
    views: { type: Number, default: 0 },
    uniquelyViewedBy: [{ type: String }],
    viewedByAdminAt: { type: Date },
    verifiedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Asset', assetSchema);
