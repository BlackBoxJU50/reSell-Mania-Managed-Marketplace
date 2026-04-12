const Asset = require('../models/Asset');
const User = require('../models/User');

exports.createAsset = async (req, res) => {
    try {
        const { title, description, category, categoryData, legalityImages, productImages, productVideo, price } = req.body;
        
        if (!title || !description || !category || price === undefined) {
            return res.status(400).json({ message: 'Missing required fields: title, description, category, or price' });
        }
        if (price <= 0) {
            return res.status(400).json({ message: 'Price must be greater than zero' });
        }

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
        const assets = await Asset.find({ status: 'LIVE' })
            .populate('seller', 'name rating')
            .sort({ views: -1 });
        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAssetById = async (req, res) => {
    try {
        let asset = await Asset.findById(req.params.id).populate('seller', 'name rating');
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        
        if (asset.status === 'LIVE') {
            const viewerId = req.user ? req.user.id : req.ip;
            if (viewerId && !asset.uniquelyViewedBy.includes(viewerId)) {
                asset.uniquelyViewedBy.push(viewerId);
                asset.views = (asset.views || 0) + 1;
                await asset.save();
                
                // Track user activity for analytics
                if (req.user) {
                    await User.findByIdAndUpdate(req.user.id, { $inc: { itemsViewedCount: 1 } });
                }
            }
        }
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
