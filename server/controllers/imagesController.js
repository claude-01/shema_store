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
        const files = req.files || [];
        if (!files.length) {
            return res.status(400).json({ success: false, message: 'At least one image file is required' });
        }

        const imagePaths = files.map(file => `/uploads/${file.filename}`);
        if (req.body.product_id) {
            const database = require('../config/database');
            const existing = await database.query('SELECT COUNT(*) AS total FROM product_images WHERE product_id = ?', [req.body.product_id]);
            const startPosition = Number(existing[0]?.total || 0);
            for (const [index, imagePath] of imagePaths.entries()) {
                await database.query(
                    'INSERT INTO product_images (product_id, image_path, is_main, order_position) VALUES (?, ?, ?, ?)',
                    [req.body.product_id, imagePath, startPosition === 0 && index === 0 ? 1 : 0, startPosition + index]
                );
            }
        }

        return res.status(201).json({ success: true, image_paths: imagePaths, files: files.map(file => file.filename) });
    } catch (error) {
        console.error('uploadImage error:', error);
        return res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
};
