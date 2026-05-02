const { Watchlist } = require('../models/index')();

exports.getWatchlist = async (req, res) => {
    try {
        const items = await Watchlist.find({ user: req.user.id });
        res.status(200).json({ success: true, count: items.length, data: items });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.addToWatchlist = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const item = await Watchlist.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updateWatchlistItem = async (req, res) => {
    try {
        let item = await Watchlist.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
        if (item.user.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });
        item = await Watchlist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: item });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.removeFromWatchlist = async (req, res) => {
    try {
        const item = await Watchlist.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
        if (item.user.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });
        await item.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};
