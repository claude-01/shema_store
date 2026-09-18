const fs = require('fs');
const path = require('path');

exports.listImages = async (req, res) => {
    try {
        const imagesDir = path.resolve(__dirname, '../../images');
        const files = await fs.promises.readdir(imagesDir);
        // Filter common image extensions
        const images = files.filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f));
        return res.json({ success: true, images });
    } catch (error) {
        console.error('listImages error:', error);
        return res.status(500).json({ success: false, message: 'Failed to list images' });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'An image file is required' });
        }

        const imagePath = `/uploads/${req.file.filename}`;
        if (req.body.product_id) {
            await require('../config/database').query(
                'INSERT INTO product_images (product_id, image_path, is_main, order_position) VALUES (?, ?, 1, 0)',
                [req.body.product_id, imagePath]
            );
        }

        return res.status(201).json({ success: true, image_path: imagePath, filename: req.file.filename });
    } catch (error) {
        console.error('uploadImage error:', error);
        return res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
};
