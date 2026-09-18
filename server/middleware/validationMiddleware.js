/**
 * SHEMA STORE - Validation Middleware
 */

const { body, validationResult } = require('express-validator');

exports.validateEmail = body('email').isEmail().normalizeEmail();

exports.validatePassword = body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters');

exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }
    next();
};
