const { User } = require('../models/index')();

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({ username, email, password });
        sendTokenResponse(user, 201, res);
    } catch (err) {
        // Duplicate key error
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0] || 'field';
            return res.status(400).json({ success: false, error: `${field} already exists` });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });

        const user = await User.findOne({ email }).select('+password');
        if (!user)
            return res.status(401).json({ success: false, error: 'Invalid credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch)
            return res.status(401).json({ success: false, error: 'Invalid credentials' });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateDetails = async (req, res) => {
    try {
        const { username, email } = req.body;
        if (!username || !email)
            return res.status(400).json({ success: false, error: 'Username and email are required' });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username, email },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0] || 'field';
            return res.status(400).json({ success: false, error: `${field} already in use` });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({ success: false, error: 'Please provide current and new password' });
        if (newPassword.length < 6)
            return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });

        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch)
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};
