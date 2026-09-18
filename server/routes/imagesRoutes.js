const express = require('express');
const router = express.Router();
const imagesController = require('../controllers/imagesController');
const upload = require('../middleware/uploadMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, imagesController.listImages);
router.post('/', requireAdmin, upload.single('image'), imagesController.uploadImage);

module.exports = router;
