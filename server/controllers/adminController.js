const User = require('../models/User');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const Order = require('../models/Order');
const Message = require('../models/Message');

// User Management
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed from protocol' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Asset Moderation
exports.getAllAssets = async (req, res) => {
    try {
        const assets = await Asset.find().populate('seller', 'name phone').sort({ createdAt: -1 });
        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAsset = async (req, res) => {
    try {
        await Asset.findByIdAndDelete(req.params.id);
        res.json({ message: 'Asset purged from marketplace' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAsset = async (req, res) => {
    try {
        const { title, description, price, category, status, serviceFee, condition } = req.body;
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        if (status === 'LIVE' && asset.status !== 'LIVE') {
            asset.verifiedAt = new Date();
        }

        if (title) asset.title = title;
        if (description) asset.description = description;
        if (price) asset.price = price;
        if (category) asset.category = category;
        if (status) asset.status = status;
        if (serviceFee !== undefined) asset.serviceFee = serviceFee;
        if (condition) asset.condition = condition;

        await asset.save();
        res.json(asset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rejectAsset = async (req, res) => {
    try {
        const { reason } = req.body;
        const asset = await Asset.findByIdAndUpdate(
            req.params.id,
            { status: 'REJECTED', rejectionReason: reason },
            { new: true }
        );
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        res.json(asset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// System Stats (Advanced)
exports.getSystemHealth = async (req, res) => {
    try {
        const [
            userCount, 
            assetCount, 
            transCount, 
            inboundPipeline,
            escrowVault,
            settledStats,
            perfectDeliveries,
            mostLoggedIn,
            mostActiveViewers
        ] = await Promise.all([
            User.countDocuments(),
            Asset.countDocuments(),
            Transaction.countDocuments(),
            Transaction.aggregate([
                { $match: { type: 'SALE', status: { $ne: 'CANCELLED' } } },
                { $group: { _id: null, total: { $sum: "$grossAmount" } } }
            ]),
            Transaction.aggregate([
                { $match: { status: 'AWAITING_FUNDS' } },
                { $group: { _id: null, total: { $sum: "$grossAmount" } } }
            ]),
            Transaction.aggregate([
                { $match: { status: 'FUNDS_CAPTURED' } },
                { $group: { _id: null, total: { $sum: "$grossAmount" } } }
            ]),
            Transaction.aggregate([
                { $match: { status: 'SETTLED' } },
                { $group: { 
                    _id: null, 
                    totalFees: { $sum: "$adminFee" },
                    totalNet: { $sum: "$netAmount" }
                } }
            ]),
            Order.countDocuments({ status: 'DELIVERED', isReturned: false }),
            User.find().sort({ loginCount: -1 }).limit(5).select('name phone loginCount'),
            User.find().sort({ itemsViewedCount: -1 }).limit(5).select('name phone itemsViewedCount')
        ]);

        res.json({
            users: userCount,
            assets: assetCount,
            transactions: transCount,
            volume: totalGMV[0]?.total || 0,
            inboundPipeline: inboundPipeline[0]?.total || 0,
            escrowVault: escrowVault[0]?.total || 0,
            pendingPayouts: settledStats[0]?.totalNet || 0,
            platformRevenue: settledStats[0]?.totalFees || 0,
            perfectDeliveries,
            analytics: {
                mostLoggedIn,
                mostActiveViewers
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPendingCounts = async (req, res) => {
    try {
        const [pendingAssets, pendingOrders, pendingMessages] = await Promise.all([
            Asset.countDocuments({ status: 'PENDING_VERIFICATION' }),
            Order.countDocuments({ status: 'PENDING' }),
            Message.countDocuments({ isRead: false })
        ]);
        res.json({ pendingAssets, pendingOrders, pendingMessages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAssetViewed = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        
        if (!asset.viewedByAdminAt) {
            asset.viewedByAdminAt = new Date();
            await asset.save();
        }
        res.json({ success: true, viewedByAdminAt: asset.viewedByAdminAt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
