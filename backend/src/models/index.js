const UserReal        = require('./User');
const PortfolioReal   = require('./Portfolio');
const WatchlistReal   = require('./Watchlist');
const TransactionReal = require('./Transaction');
const Mock            = require('../mockDb');

const getModels = () => {
    if (process.env.DB_MODE === 'mock') {
        return {
            User:        Mock.User,
            Portfolio:   Mock.Portfolio,
            Watchlist:   Mock.Watchlist,
            Transaction: Mock.Transaction
        };
    }
    return {
        User:        UserReal,
        Portfolio:   PortfolioReal,
        Watchlist:   WatchlistReal,
        Transaction: TransactionReal
    };
};

module.exports = getModels;
