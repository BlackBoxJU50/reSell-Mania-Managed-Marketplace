const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');

// Route for uploading product media (Images/Videos)
router.post('/media', auth, uploadController.uploadMedia);

module.exports = router;
