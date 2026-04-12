const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    totalPrice: { type: Number, required: true },
    shippingInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        location: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true },
    coupon: { type: String },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    isReturned: { type: Boolean, default: false },
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
