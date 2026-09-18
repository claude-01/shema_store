const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

router.get('/', deliveryController.listZones);
router.post('/', deliveryController.createZone);
router.put('/:id', deliveryController.updateZone);
router.delete('/:id', deliveryController.deleteZone);
router.get('/city/:city', deliveryController.getZoneByCity);

module.exports = router;
