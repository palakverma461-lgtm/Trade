const rateLimit = require('express-rate-limit');

exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { success: false, error: 'Too many requests, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

exports.apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200,
    message: { success: false, error: 'Too many requests, please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});
