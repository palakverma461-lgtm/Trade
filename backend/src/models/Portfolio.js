const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
    coinName: {
        type: String,
        required: [true, 'Please add a coin name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    symbol: {
        type: String,
        required: [true, 'Please add a symbol'],
        uppercase: true,
        trim: true,
        maxlength: [10, 'Symbol cannot be more than 10 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
        min: [0, 'Amount cannot be negative']
    },
    buyPrice: {
        type: Number,
        required: [true, 'Please add a buy price'],
        min: [0, 'Price cannot be negative']
    },
    currentPrice: {
        type: Number,
        min: [0, 'Price cannot be negative'],
        default: null
    },
    notes: {
        type: String,
        maxlength: [200, 'Notes cannot exceed 200 characters'],
        default: ''
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
