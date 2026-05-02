const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            error: errors.array()[0].msg
        });
    }
    next();
};

const registerRules = [
    body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

const assetRules = [
    body('coinName').trim().notEmpty().withMessage('Coin name is required').isLength({ max: 50 }).withMessage('Coin name max 50 chars'),
    body('symbol').trim().notEmpty().withMessage('Symbol is required').isLength({ max: 10 }).withMessage('Symbol max 10 chars'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('buyPrice').isFloat({ min: 0 }).withMessage('Buy price must be a positive number'),
    body('currentPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Current price must be positive'),
    body('notes').optional().isLength({ max: 200 }).withMessage('Notes max 200 characters'),
];

module.exports = { handleValidation, registerRules, loginRules, assetRules };
