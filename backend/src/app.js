const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const auth         = require('./routes/v1/auth');
const portfolio    = require('./routes/v1/portfolio');
const watchlist    = require('./routes/v1/watchlist');
const transactions = require('./routes/v1/transactions');

const app = express();

app.use(express.json({ limit: '10kb' }));

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'PrimeTrade API is running', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth',         auth);
app.use('/api/v1/portfolio',    portfolio);
app.use('/api/v1/watchlist',    watchlist);
app.use('/api/v1/transactions', transactions);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({ success: false, error: `${field} already exists` });
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const msg = Object.values(err.errors).map(e => e.message).join(', ');
        return res.status(400).json({ success: false, error: msg });
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message
    });
});

module.exports = app;
