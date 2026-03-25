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
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
