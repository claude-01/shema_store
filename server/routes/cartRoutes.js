/**
 * SHEMA STORE - Shopping Cart Route
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Get cart' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Add to cart' });
});

router.put('/:itemId', (req, res) => {
    res.json({ message: 'Update cart item' });
});

router.delete('/:itemId', (req, res) => {
    res.json({ message: 'Remove from cart' });
});

router.delete('/', (req, res) => {
    res.json({ message: 'Clear cart' });
});

module.exports = router;
