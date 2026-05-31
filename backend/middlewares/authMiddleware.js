const jwt = require('jsonwebtoken');
const db = require('../config/db'); // ✅ thêm import db

exports.verifyToken = async (req, res, next) => { // ✅ thêm async
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Bạn cần đăng nhập để thực hiện thao tác này" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [users] = await db.execute(
            "SELECT is_active, ban_reason FROM Users WHERE id = ? AND deleted_at IS NULL",
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: "Tài khoản không tồn tại" });
        }

        if (!users[0].is_active) {
            const banMsg = users[0].ban_reason
                ? `Tài khoản của bạn đã bị khóa. Lý do: ${users[0].ban_reason}`
                : "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.";
            return res.status(403).json({ success: false, message: banMsg });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện hành động này" });
        }
        next();
    };
};