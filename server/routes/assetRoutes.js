const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { auth, admin } = require('../middleware/auth');

router.post('/', auth, assetController.createAsset);
router.get('/', assetController.getAssets);
router.get('/pending', auth, admin, assetController.getPendingAssets);
router.get('/my-listings', auth, assetController.getMyListings);
router.get('/:id', assetController.getAssetById);
router.patch('/:id/verify', auth, admin, assetController.verifyAsset);

module.exports = router;
