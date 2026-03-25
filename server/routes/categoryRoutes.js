const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, admin } = require('../middleware/auth');

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 */
router.get('/', categoryController.getCategories);

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Add new category (Admin only)
 *     tags: [Categories]
 */
router.post('/', auth, admin, categoryController.addCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Remove category (Admin only)
 *     tags: [Categories]
 */
router.delete('/:id', auth, admin, categoryController.deleteCategory);

module.exports = router;
