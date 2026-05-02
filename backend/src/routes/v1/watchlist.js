const express = require('express');
const { getWatchlist, addToWatchlist, updateWatchlistItem, removeFromWatchlist } = require('../../controllers/watchlist');
const { protect } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();
router.use(protect, apiLimiter);

router.route('/').get(getWatchlist).post(addToWatchlist);
router.route('/:id').put(updateWatchlistItem).delete(removeFromWatchlist);

module.exports = router;
