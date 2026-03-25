const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    grossAmount: { type: Number, required: true },
    netAmount: { type: Number, required: true }, // 90%
    adminFee: { type: Number, required: true },   // 10%
    status: {
        type: String,
        enum: ['AWAITING_FUNDS', 'FUNDS_CAPTURED', 'REFUNDED', 'SETTLEMENT_PENDING', 'SETTLED'],
        default: 'AWAITING_FUNDS'
    },
    paymentReceiptUrl: { type: String },
    ownershipCertificateUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
