/**
 * SHEMA STORE - Review Controller
 */

const db = require('../config/database');

exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await db.query(`
            SELECT r.id, r.product_id, r.rating, r.comment, r.created_at,
                   CONCAT(u.first_name, ' ', u.last_name) AS customer
            FROM reviews r
            JOIN users u ON u.id = r.user_id
            WHERE r.product_id = ? AND r.is_approved = 1
            ORDER BY r.created_at DESC
        `, [req.params.productId]);
        return res.json({ success: true, reviews });
    } catch (error) {
        console.error('getProductReviews error:', error);
        return res.status(500).json({ success: false, message: 'Failed to load reviews' });
    }
};

exports.createReview = async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({ success: false, message: 'Please log in to rate this product' });
        }

        const { productId, rating, comment } = req.body;
        const numericRating = Number(rating);
        if (!productId || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: 'Choose a rating from 1 to 5 stars' });
        }

        const product = await db.query('SELECT id FROM products WHERE id = ? LIMIT 1', [productId]);
        if (!product.length) return res.status(404).json({ success: false, message: 'Product not found' });

        await db.query(
            'INSERT INTO reviews (product_id, user_id, rating, comment, is_approved) VALUES (?, ?, ?, ?, 1)',
            [productId, req.session.userId, numericRating, String(comment || '').trim()]
        );
        return res.status(201).json({ success: true, message: 'Thank you for rating this product' });
    } catch (error) {
        console.error('createReview error:', error);
        return res.status(500).json({ success: false, message: 'Failed to save your rating' });
    }
};

exports.updateReview = async (req, res) => {
    // To be implemented
    res.json({ message: 'Update review' });
};

exports.deleteReview = async (req, res) => {
    // To be implemented
    res.json({ message: 'Delete review' });
};

exports.getAllReviews = async (req, res) => {
    // To be implemented
    res.json({ message: 'Get all reviews' });
};
