const Order = require('../models/Order');
const Asset = require('../models/Asset');
const Ledger = require('../models/Ledger');
const Transaction = require('../models/Transaction');

exports.createOrder = async (req, res) => {
    try {
        const { assetId, shippingInfo, paymentMethod } = req.body;
        const asset = await Asset.findById(assetId);
        
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        if (asset.status !== 'LIVE') return res.status(400).json({ message: 'Asset is no longer available for purchase' });

        const newOrder = new Order({
            buyer: req.user.id,
            seller: asset.seller,
            asset: assetId,
            totalPrice: asset.price,
            shippingInfo,
            paymentMethod
        });

        const order = await newOrder.save();

        // Update Asset status to SOLD
        await Asset.findByIdAndUpdate(assetId, { status: 'SOLD' });

        res.json(order);
    } catch (err) {
        console.error('Order Creation Error:', err);
        res.status(500).json({ error: 'Server error during order creation', message: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .populate('asset', 'title price');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user.id })
            .populate('asset', 'title price productImages')
            .populate('seller', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const oldStatus = order.status;
        order.status = status;
        await order.save();

        // If moved to SHIPPED, capture the platform fee in Ledger
        if (status === 'SHIPPED' && oldStatus !== 'SHIPPED') {
            const adminFee = order.totalPrice * 0.10;
            
            // Create a pseudo-transaction or link to existing if you have a full transaction model
            // For now, let's record the platform fee in the Ledger directly
            const feeEntry = new Ledger({
                direction: 'IN',
                amount: adminFee,
                type: 'PLATFORM_FEE',
                status: 'COMPLETED',
                note: `Fee for order ${order._id}`
            });
            await feeEntry.save();
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
