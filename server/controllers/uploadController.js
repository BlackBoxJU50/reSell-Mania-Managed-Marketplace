const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder',
    api_key: process.env.CLOUDINARY_API_KEY || 'placeholder',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder',
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'resellmania',
        resource_type: 'auto', // Support both images and videos
        allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov'],
    },
});

const upload = multer({ storage: storage });

exports.uploadMedia = [
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'video', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            if (!req.files) {
                return res.status(400).json({ message: 'No files uploaded' });
            }

            const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
            const video = req.files['video'] ? req.files['video'][0].path : null;

            res.status(200).json({
                success: true,
                images,
                video
            });
        } catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ message: 'Error uploading media', error: error.message });
        }
    }
];
