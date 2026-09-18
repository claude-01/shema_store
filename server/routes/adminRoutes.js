/**
 * SHEMA STORE - Admin Routes
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.post('/login', adminController.adminLogin);
router.post('/logout', adminController.adminLogout);
router.get('/me', requireAdmin, adminController.getAdminProfile);
router.get('/dashboard', requireAdmin, adminController.getDashboardOverview);
router.put('/credentials', requireAdmin, adminController.updateAdminCredentials);

module.exports = router;
