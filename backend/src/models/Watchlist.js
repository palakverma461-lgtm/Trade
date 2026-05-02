const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
    coinName:     { type: String, required: true, trim: true, maxlength: 50 },
    symbol:       { type: String, required: true, uppercase: true, trim: true, maxlength: 10 },
    targetPrice:  { type: Number, min: 0, default: null },
    notes:        { type: String, maxlength: 200, default: '' },
    user:         { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);
