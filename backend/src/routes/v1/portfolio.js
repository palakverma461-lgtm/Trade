const express = require('express');
const { getAssets, getAsset, addAsset, updateAsset, deleteAsset, getStats, getAiInsights } = require('../../controllers/portfolio');
const { protect } = require('../../middleware/auth');
const { assetRules, handleValidation } = require('../../middleware/validate');
const { apiLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.use(protect);
router.use(apiLimiter);

router.get('/stats', getStats);
router.get('/ai-insights', getAiInsights);
router.route('/').get(getAssets).post(assetRules, handleValidation, addAsset);
router.route('/:id').get(getAsset).put(assetRules, handleValidation, updateAsset).delete(deleteAsset);

module.exports = router;
