const express = require('express');
const { getTransactions, addTransaction, deleteTransaction } = require('../../controllers/transactions');
const { protect } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();
router.use(protect, apiLimiter);

router.route('/').get(getTransactions).post(addTransaction);
router.route('/:id').delete(deleteTransaction);

module.exports = router;
