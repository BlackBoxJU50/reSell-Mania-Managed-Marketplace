const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        console.log(`[AUTH] Registration attempt for: ${email}`);

        if (!process.env.JWT_SECRET) {
            console.error('[AUTH] CRITICAL: JWT_SECRET is missing from environment variables!');
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password, role: role || 'participant' });
        await user.save();
        console.log(`[AUTH] User created successfully: ${email}`);

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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
