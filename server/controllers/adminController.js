const User = require('../models/User');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');

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
        const assets = await Asset.find().populate('seller', 'name email').sort({ createdAt: -1 });
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

// System Stats (Advanced)
exports.getSystemHealth = async (req, res) => {
    try {
        const [
            userCount, 
            assetCount, 
            transCount, 
            inboundPipeline,
            escrowVault,
            settledStats
        ] = await Promise.all([
            User.countDocuments(),
            Asset.countDocuments(),
            Transaction.countDocuments(),
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
            ])
        ]);

        res.json({
            users: userCount,
            assets: assetCount,
            transactions: transCount,
            inboundPipeline: inboundPipeline[0]?.total || 0,
            escrowVault: escrowVault[0]?.total || 0,
            pendingPayouts: settledStats[0]?.totalNet || 0,
            volume: settledStats[0]?.totalFees || 0 // Platform Revenue
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPendingCounts = async (req, res) => {
    try {
        const [pendingAssets, pendingOrders] = await Promise.all([
            Asset.countDocuments({ status: 'PENDING_VERIFICATION' }),
            Order.countDocuments({ status: 'PENDING' })
        ]);
        res.json({ pendingAssets, pendingOrders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
