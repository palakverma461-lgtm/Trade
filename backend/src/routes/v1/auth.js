const express = require('express');
const { register, login, getMe, updateDetails, updatePassword } = require('../../controllers/auth');
const { protect } = require('../../middleware/auth');
const { registerRules, loginRules, handleValidation } = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, registerRules, handleValidation, register);
router.post('/login', authLimiter, loginRules, handleValidation, login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
