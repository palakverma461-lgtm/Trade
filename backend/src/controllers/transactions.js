const { Transaction } = require('../models/index')();

exports.getTransactions = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip  = (page - 1) * limit;
        const query = { user: req.user.id };

        let transactions, total;
        if (typeof Transaction.countDocuments === 'function') {
            total        = await Transaction.countDocuments(query);
            transactions = await Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        } else {
            const all    = await Transaction.find(query);
            total        = all.length;
            transactions = all.slice(skip, skip + limit);
        }

        res.status(200).json({ success: true, count: transactions.length, total, page, pages: Math.ceil(total / limit), data: transactions });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.addTransaction = async (req, res) => {
    try {
        req.body.user  = req.user.id;
        req.body.total = req.body.amount * req.body.price;
        const tx = await Transaction.create(req.body);
        res.status(201).json({ success: true, data: tx });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const tx = await Transaction.findById(req.params.id);
        if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
        if (tx.user.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });
        await tx.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};
