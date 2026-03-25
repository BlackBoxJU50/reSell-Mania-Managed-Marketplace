const Asset = require('../models/Asset');

exports.createAsset = async (req, res) => {
    try {
        const { title, description, category, categoryData, legalityImages, productImages, productVideo, price } = req.body;
        const newAsset = new Asset({
            seller: req.user.id,
            title,
            description,
            category,
            categoryData,
            legalityImages,
            productImages,
            productVideo,
            price
        });
        const asset = await newAsset.save();
        res.json(asset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAssets = async (req, res) => {
    try {
        const assets = await Asset.find({ status: 'LIVE' }).populate('seller', 'name rating');
        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id).populate('seller', 'name rating');
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        res.json(asset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(req.params.id, { status: 'LIVE' }, { new: true });
        res.json(asset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPendingAssets = async (req, res) => {
    try {
        const assets = await Asset.find({ status: 'PENDING_VERIFICATION' }).populate('seller', 'name email');
        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyListings = async (req, res) => {
    try {
        const assets = await Asset.find({ seller: req.user.id }).sort({ createdAt: -1 });
        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
