const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary Configuration
console.log('[CLOUDINARY] Initializing with Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'resellmania',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov'],
    },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}).fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
]);

exports.uploadMedia = (req, res, next) => {
    console.log('[UPLOAD] Starting media upload process...');
    upload(req, res, (err) => {
        if (err) {
            console.error('[UPLOAD] Multer/Cloudinary Error:', err);
            return res.status(500).json({ 
                message: 'Error uploading to Cloudinary', 
                error: err.message,
                details: err.http_code ? `Status ${err.http_code}` : 'No extra details'
            });
        }
        console.log('[UPLOAD] Processing uploaded files...');
        
        try {
            if (!req.files) {
                return res.status(400).json({ message: 'No files uploaded' });
            }

            const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
            const video = req.files['video'] ? req.files['video'][0].path : null;

            console.log(`[UPLOAD] Successfully processed ${images.length} images and ${video ? '1' : '0'} video`);

            res.status(200).json({
                success: true,
                images,
                video
            });
        } catch (error) {
            console.error('[UPLOAD] Post-upload Processing Error:', error);
            res.status(500).json({ message: 'Error processing media after upload', error: error.message });
        }
    });
};
