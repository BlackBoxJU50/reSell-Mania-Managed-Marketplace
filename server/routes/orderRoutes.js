const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, admin } = require('../middleware/auth');

router.post('/', auth, orderController.createOrder);
router.get('/', auth, admin, orderController.getOrders);
router.get('/my-orders', auth, orderController.getUserOrders);
router.patch('/:id/status', auth, admin, orderController.updateOrderStatus);

module.exports = router;
