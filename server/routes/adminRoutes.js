const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const orderController = require('../controllers/orderController');
const { auth, admin } = require('../middleware/auth');

router.patch('/orders/:id', auth, admin, orderController.updateOrderStatus);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 */
router.get('/users', auth, admin, adminController.getAllUsers);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 */
router.delete('/users/:id', auth, admin, adminController.deleteUser);

/**
 * @openapi
 * /api/admin/assets:
 *   get:
 *     summary: Get all assets for moderation
 *     tags: [Admin]
 */
router.get('/assets', auth, admin, adminController.getAllAssets);

/**
 * @openapi
 * /api/admin/assets/{id}:
 *   delete:
 *     summary: Delete an asset
 *     tags: [Admin]
 */
router.delete('/assets/:id', auth, admin, adminController.deleteAsset);
router.patch('/assets/:id', auth, admin, adminController.updateAsset);

/**
 * @openapi
 * /api/admin/health:
 *   get:
 *     summary: System-wide metrics
 *     tags: [Admin]
 */
router.get('/health', auth, admin, adminController.getSystemHealth);
router.get('/counts', auth, admin, adminController.getPendingCounts);
router.post('/assets/:id/reject', auth, admin, adminController.rejectAsset);
router.patch('/assets/:id/view', auth, admin, adminController.markAssetViewed);

module.exports = router;
