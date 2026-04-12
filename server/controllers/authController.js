const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, phone, password, role } = req.body;
        console.log(`[AUTH] Registration attempt for phone: ${phone}`);

        if (!process.env.JWT_SECRET) {
            console.error('[AUTH] CRITICAL: JWT_SECRET is missing from environment variables!');
        }

        let user = await User.findOne({ phone });
        if (user) return res.status(400).json({ message: 'Phone number already registered' });

        user = new User({ name, phone, password, role: role || 'participant' });
        await user.save();
        console.log(`[AUTH] User created successfully: ${phone}`);

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } });
    } catch (err) {
        console.error('Registration Error Details:', err);
        res.status(500).json({ 
            error: 'Server error during registration', 
            message: err.message 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await User.findOne({ phone });
        if (!user) return res.status(400).json({ message: 'Invalid phone or password' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid phone or password' });

        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ 
            error: 'Server error during login', 
            message: err.message 
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { phone, location } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { phone, location },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change Password Error:', err);
        res.status(500).json({ message: 'Server error while updating password' });
    }
};
