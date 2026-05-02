const jwt = require('jsonwebtoken');

let users = [{
    _id: 'default_admin_id',
    username: 'AdminDemo',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    createdAt: new Date()
}];

let portfolio = [
    { _id: 'demo_1', coinName: 'Bitcoin',   symbol: 'BTC',  amount: 0.5,  buyPrice: 42000, currentPrice: 67000, notes: 'Long-term hold',  user: 'default_admin_id', createdAt: new Date('2024-01-15') },
    { _id: 'demo_2', coinName: 'Ethereum',  symbol: 'ETH',  amount: 4,    buyPrice: 2200,  currentPrice: 3500,  notes: 'DeFi exposure',   user: 'default_admin_id', createdAt: new Date('2024-02-10') },
    { _id: 'demo_3', coinName: 'Solana',    symbol: 'SOL',  amount: 20,   buyPrice: 95,    currentPrice: 172,   notes: 'High growth bet', user: 'default_admin_id', createdAt: new Date('2024-03-05') },
    { _id: 'demo_4', coinName: 'Chainlink', symbol: 'LINK', amount: 150,  buyPrice: 14,    currentPrice: 18,    notes: 'Oracle play',     user: 'default_admin_id', createdAt: new Date('2024-03-20') },
    { _id: 'demo_5', coinName: 'Polygon',   symbol: 'MATIC',amount: 2000, buyPrice: 0.85,  currentPrice: 0.62,  notes: 'Layer 2',         user: 'default_admin_id', createdAt: new Date('2024-04-01') },
    { _id: 'demo_6', coinName: 'Avalanche', symbol: 'AVAX', amount: 30,   buyPrice: 38,    currentPrice: 41,    notes: '',                user: 'default_admin_id', createdAt: new Date('2024-04-15') },
];

let watchlist = [
    { _id: 'watch_1', coinName: 'Cardano',  symbol: 'ADA',  targetPrice: 0.65, notes: 'Waiting for dip', user: 'default_admin_id', createdAt: new Date('2024-05-01') },
    { _id: 'watch_2', coinName: 'Polkadot', symbol: 'DOT',  targetPrice: 8.5,  notes: 'Parachain growth',user: 'default_admin_id', createdAt: new Date('2024-05-10') },
    { _id: 'watch_3', coinName: 'Cosmos',   symbol: 'ATOM', targetPrice: 10,   notes: 'IBC ecosystem',   user: 'default_admin_id', createdAt: new Date('2024-05-15') },
];

let transactions = [
    { _id: 'tx_1', coinName: 'Bitcoin',   symbol: 'BTC',  type: 'BUY',  amount: 0.5,  price: 42000, total: 21000, notes: 'Initial buy',    user: 'default_admin_id', createdAt: new Date('2024-01-15') },
    { _id: 'tx_2', coinName: 'Ethereum',  symbol: 'ETH',  type: 'BUY',  amount: 4,    price: 2200,  total: 8800,  notes: '',               user: 'default_admin_id', createdAt: new Date('2024-02-10') },
    { _id: 'tx_3', coinName: 'Solana',    symbol: 'SOL',  type: 'BUY',  amount: 20,   price: 95,    total: 1900,  notes: 'Dip buy',        user: 'default_admin_id', createdAt: new Date('2024-03-05') },
    { _id: 'tx_4', coinName: 'Chainlink', symbol: 'LINK', type: 'BUY',  amount: 150,  price: 14,    total: 2100,  notes: '',               user: 'default_admin_id', createdAt: new Date('2024-03-20') },
    { _id: 'tx_5', coinName: 'Polygon',   symbol: 'MATIC',type: 'BUY',  amount: 2000, price: 0.85,  total: 1700,  notes: 'Layer 2 bet',    user: 'default_admin_id', createdAt: new Date('2024-04-01') },
    { _id: 'tx_6', coinName: 'Avalanche', symbol: 'AVAX', type: 'BUY',  amount: 30,   price: 38,    total: 1140,  notes: '',               user: 'default_admin_id', createdAt: new Date('2024-04-15') },
    { _id: 'tx_7', coinName: 'Ethereum',  symbol: 'ETH',  type: 'SELL', amount: 1,    price: 3200,  total: 3200,  notes: 'Partial profit', user: 'default_admin_id', createdAt: new Date('2024-05-01') },
];

function attachMethods(user) {
    if (!user) return null;
    return {
        ...user,
        get id() { return this._id; },
        matchPassword: async function(pass) { return pass === this.password; },
        getSignedJwtToken: function() {
            return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
        },
        select: function() { return this; },
        save: async function() {
            const idx = users.findIndex(u => u._id === this._id);
            if (idx !== -1) {
                const clean = { ...this };
                ['matchPassword','getSignedJwtToken','select','save'].forEach(k => delete clean[k]);
                users[idx] = clean;
            }
        }
    };
}

function makeCRUD(store) {
    return {
        find: function(query) {
            let results = store.filter(p => !query || !query.user || p.user === query.user);
            return {
                sort: function() { return this; },
                skip: function() { return this; },
                limit: function() { return this; },
                populate: () => results,
                then: (resolve) => resolve(results)
            };
        },
        findById: async (id) => {
            const item = store.find(p => p._id === id);
            if (!item) return null;
            return {
                ...item,
                user: { toString: () => item.user },
                deleteOne: async function() {
                    const idx = store.findIndex(p => p._id === id);
                    if (idx !== -1) store.splice(idx, 1);
                }
            };
        },
        create: async (data) => {
            const newItem = { ...data, total: data.amount && data.price ? data.amount * data.price : data.total, _id: Date.now().toString(), createdAt: new Date() };
            store.push(newItem);
            return newItem;
        },
        findByIdAndUpdate: async (id, data) => {
            const index = store.findIndex(p => p._id === id);
            if (index === -1) return null;
            store[index] = { ...store[index], ...data };
            return store[index];
        }
    };
}

const User = {
    create: async (userData) => {
        const base = { ...userData, _id: Date.now().toString(), createdAt: new Date() };
        users.push({ ...base });
        return attachMethods(base);
    },
    findOne: function(query) {
        const user = users.find(u => u.email === query.email) || null;
        const result = attachMethods(user);
        return { select: function() { return this; }, then: (r, j) => Promise.resolve(result).then(r, j), catch: (j) => Promise.resolve(result).catch(j) };
    },
    findById: function(id) {
        const user = users.find(u => u._id === id) || null;
        const result = attachMethods(user);
        return { select: function() { return this; }, then: (r, j) => Promise.resolve(result).then(r, j), catch: (j) => Promise.resolve(result).catch(j) };
    },
    findByIdAndUpdate: async (id, data) => {
        const index = users.findIndex(u => u._id === id);
        if (index === -1) return null;
        users[index] = { ...users[index], ...data };
        return attachMethods(users[index]);
    }
};

const Portfolio   = makeCRUD(portfolio);
const Watchlist   = makeCRUD(watchlist);
const Transaction = makeCRUD(transactions);

module.exports = { User, Portfolio, Watchlist, Transaction };
