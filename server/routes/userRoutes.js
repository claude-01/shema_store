/**
 * SHEMA STORE - User Routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.get('/orders', userController.getUserOrders);
router.get('/orders/:id', userController.getUserOrderById);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;
