const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
    direction: { type: String, enum: ['IN', 'OUT'], required: true },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: ['BUYER_PAYMENT', 'SELLER_PAYOUT', 'PLATFORM_FEE'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    auditTrail: [{
        action: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        notes: String
    }],
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ledger', ledgerSchema);
