const jwt = require('jsonwebtoken');
const db = require('../config/db'); // ✅ added db import

exports.verifyToken = async (req, res, next) => { // ✅ added async
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "You need to log in to perform this action" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [users] = await db.execute(
            "SELECT is_active, ban_reason FROM Users WHERE id = ? AND deleted_at IS NULL",
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: "Account not found" });
        }

        if (!users[0].is_active) {
            const banMsg = users[0].ban_reason
                ? `Your account has been banned. Reason: ${users[0].ban_reason}`
                : "Your account has been banned. Please contact support.";
            return res.status(403).json({ success: false, message: banMsg });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
};

exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
        }
        next();
    };
};