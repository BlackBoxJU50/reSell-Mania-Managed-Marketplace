const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    let token = req.header('x-auth-token') || req.header('Authorization');
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

const admin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

const optionalAuth = (req, res, next) => {
    let token = req.header('x-auth-token') || req.header('Authorization');
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (e) {}
    next();
};

module.exports = { auth, admin, optionalAuth };
