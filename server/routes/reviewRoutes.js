/**
 * SHEMA STORE - Review Routes
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/product/:productId', reviewController.getProductReviews);
router.get('/', requireAdmin, reviewController.getAllReviews);
router.post('/', reviewController.createReview);
router.put('/:id', requireAdmin, reviewController.updateReview);
router.delete('/:id', requireAdmin, reviewController.deleteReview);

module.exports = router;
