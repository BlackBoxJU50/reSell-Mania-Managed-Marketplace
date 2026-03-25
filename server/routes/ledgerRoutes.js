const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const { auth, admin } = require('../middleware/auth');

router.post('/transaction', auth, ledgerController.createTransaction);
router.patch('/transaction/:transactionId/capture', auth, admin, ledgerController.captureFunds);
router.patch('/transaction/:transactionId/settle', auth, admin, ledgerController.settleTransaction);

router.get('/transactions', auth, admin, async (req, res) => {
    try {
        const Transaction = require('../models/Transaction');
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', auth, admin, async (req, res) => {
    try {
        const Ledger = require('../models/Ledger');
        const ledger = await Ledger.find().sort({ timestamp: -1 });
        res.json(ledger);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
