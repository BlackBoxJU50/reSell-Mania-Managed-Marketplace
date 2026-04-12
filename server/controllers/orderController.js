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
        if (asset.seller.toString() === req.user.id.toString()) {
            return res.status(400).json({ message: 'You cannot buy your own product' });
        }

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
            .populate('buyer', 'name phone')
            .populate('seller', 'name phone')
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
        const { status, coupon } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const oldStatus = order.status;
        if (status) order.status = status;
        if (coupon !== undefined) order.coupon = coupon;
        
        await order.save();

        // Timestamps for lifecycle tracking
        if (status === 'CONFIRMED' && oldStatus !== 'CONFIRMED') {
            order.confirmedAt = new Date();
        }
        if (status === 'SHIPPED' && oldStatus !== 'SHIPPED') {
            order.shippedAt = new Date();
            
            // Capture the platform fee in Ledger
            const adminFee = order.serviceFee || (order.totalPrice * 0.10);
            const feeEntry = new Ledger({
                direction: 'IN',
                amount: adminFee,
                type: 'PLATFORM_FEE',
                status: 'COMPLETED',
                note: `Fee for order ${order._id}`
            });
            await feeEntry.save();
        }
        if (status === 'DELIVERED' && oldStatus !== 'DELIVERED') {
            order.deliveredAt = new Date();
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
