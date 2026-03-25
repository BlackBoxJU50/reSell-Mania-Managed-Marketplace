const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const Asset = require('../models/Asset');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

exports.createTransaction = async (req, res) => {
    try {
        const { assetId } = req.body;
        const asset = await Asset.findById(assetId);
        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        const adminFee = asset.price * 0.10;
        const netAmount = asset.price * 0.90;

        const transaction = new Transaction({
            asset: assetId,
            buyer: req.user.id,
            seller: asset.seller,
            grossAmount: asset.price,
            netAmount,
            adminFee,
            status: 'AWAITING_FUNDS'
        });

        await transaction.save();

        // Create Inbound Ledger Entry (Pending)
        const ledgerEntry = new Ledger({
            transaction: transaction._id,
            direction: 'IN',
            amount: asset.price,
            type: 'BUYER_PAYMENT',
            status: 'PENDING'
        });
        await ledgerEntry.save();

        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.captureFunds = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await Transaction.findByIdAndUpdate(transactionId, { status: 'FUNDS_CAPTURED' }, { new: true });

        // Update Ledger
        await Ledger.findOneAndUpdate(
            { transaction: transactionId, direction: 'IN' },
            { status: 'COMPLETED' }
        );

        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.settleTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await Transaction.findByIdAndUpdate(transactionId, { status: 'SETTLED' }, { new: true });

        // Create Outbound Ledger Entry
        const payoutLedger = new Ledger({
            transaction: transactionId,
            direction: 'OUT',
            amount: transaction.netAmount,
            type: 'SELLER_PAYOUT',
            status: 'COMPLETED'
        });
        await payoutLedger.save();

        // Create Platform Fee Ledger Entry
        const feeLedger = new Ledger({
            transaction: transactionId,
            direction: 'IN', // Platform keeps this
            amount: transaction.adminFee,
            type: 'PLATFORM_FEE',
            status: 'COMPLETED'
        });
        await feeLedger.save();

        // Digital Vault: Generate Ownership Certificate
        const certificateId = uuidv4();
        const qrData = JSON.stringify({
            certificateId,
            transactionId,
            asset: transaction.asset,
            buyer: transaction.buyer,
            timestamp: new Date()
        });
        const qrCodeUrl = await QRCode.toDataURL(qrData);

        transaction.ownershipCertificateUrl = qrCodeUrl;
        await transaction.save();

        res.json({ transaction, certificateId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
