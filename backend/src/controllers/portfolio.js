const { Portfolio } = require('../models/index')();
const { generateInsights } = require('../utils/aiInsights');

exports.getAssets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = req.user.role === 'admin' ? {} : { user: req.user.id };

        let assets;
        let total;

        if (typeof Portfolio.countDocuments === 'function') {
            total = await Portfolio.countDocuments(query);
            assets = await Portfolio.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
        } else {
            // mock mode
            const all = await Portfolio.find(query);
            total = all.length;
            assets = all.slice(skip, skip + limit);
        }

        res.status(200).json({
            success: true,
            count: assets.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: assets
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getAsset = async (req, res) => {
    try {
        const asset = await Portfolio.findById(req.params.id);
        if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
        if (asset.user.toString() !== req.user.id && req.user.role !== 'admin')
            return res.status(403).json({ success: false, error: 'Not authorized' });
        res.status(200).json({ success: true, data: asset });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.addAsset = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const asset = await Portfolio.create(req.body);
        res.status(201).json({ success: true, data: asset });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateAsset = async (req, res) => {
    try {
        let asset = await Portfolio.findById(req.params.id);
        if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
        if (asset.user.toString() !== req.user.id && req.user.role !== 'admin')
            return res.status(403).json({ success: false, error: 'Not authorized' });

        asset = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: asset });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteAsset = async (req, res) => {
    try {
        const asset = await Portfolio.findById(req.params.id);
        if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
        if (asset.user.toString() !== req.user.id && req.user.role !== 'admin')
            return res.status(403).json({ success: false, error: 'Not authorized' });
        await asset.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getAiInsights = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };
        const assets = await Portfolio.find(query);
        const rawAssets = assets.map(a => a.toObject ? a.toObject() : a);
        const insights = generateInsights(rawAssets);
        res.status(200).json({ success: true, data: insights });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };
        let assets;

        if (typeof Portfolio.countDocuments === 'function') {
            assets = await Portfolio.find(query);
        } else {
            assets = await Portfolio.find(query);
        }

        if (!assets.length) {
            return res.status(200).json({
                success: true,
                data: { totalInvested: 0, totalCurrentValue: 0, totalPnl: 0, totalPnlPct: 0, totalAssets: 0, bestAsset: null, worstAsset: null }
            });
        }

        const withPnl = assets.map(a => {
            const obj = a.toObject ? a.toObject() : a;
            const cp = obj.currentPrice || obj.buyPrice;
            const currentVal = obj.amount * cp;
            const investedVal = obj.amount * obj.buyPrice;
            const pnlPct = investedVal > 0 ? ((currentVal - investedVal) / investedVal) * 100 : 0;
            return { ...obj, currentVal, investedVal, pnlPct };
        });

        const totalInvested = withPnl.reduce((s, a) => s + a.investedVal, 0);
        const totalCurrentValue = withPnl.reduce((s, a) => s + a.currentVal, 0);
        const totalPnl = totalCurrentValue - totalInvested;
        const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
        const sorted = [...withPnl].sort((a, b) => b.pnlPct - a.pnlPct);

        res.status(200).json({
            success: true,
            data: {
                totalInvested,
                totalCurrentValue,
                totalPnl,
                totalPnlPct,
                totalAssets: assets.length,
                bestAsset: sorted[0],
                worstAsset: sorted[sorted.length - 1]
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
