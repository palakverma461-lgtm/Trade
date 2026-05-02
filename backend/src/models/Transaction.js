const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    coinName:  { type: String, required: true, trim: true },
    symbol:    { type: String, required: true, uppercase: true, trim: true },
    type:      { type: String, enum: ['BUY', 'SELL'], required: true },
    amount:    { type: Number, required: true, min: 0 },
    price:     { type: Number, required: true, min: 0 },
    total:     { type: Number },
    notes:     { type: String, maxlength: 200, default: '' },
    user:      { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

TransactionSchema.pre('save', function(next) {
    this.total = this.amount * this.price;
    next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
