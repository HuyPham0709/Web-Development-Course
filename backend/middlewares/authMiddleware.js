const jwt = require('jsonwebtoken');
const db = require('../config/db'); 

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "You need to log in to perform this action" });
    }

    try {
        // 1. Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2. Truy vấn Database kiểm tra trạng thái tài khoản
        const [users] = await db.execute(
            "SELECT is_active, ban_reason FROM users WHERE id = ? AND deleted_at IS NULL",
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

        // 3. Nếu mọi thứ hợp lệ, gắn user vào request và cho đi tiếp
        req.user = decoded;
        next();

    } catch (error) {
        // 🛑 IN LỖI RA CONSOLE ĐỂ XEM TRÊN LOGS CỦA RENDER
        console.error("🔴 [AUTH MIDDLEWARE ERROR]:", error);

        // --- PHÂN LOẠI LỖI RÕ RÀNG ---

        // Trường hợp 1: Token thực sự hết hạn
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ success: false, message: "expired token" });
        } 
        
        // Trường hợp 2: Token bị sai lệch, không hợp lệ
        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ success: false, message: "invalid token" });
        }

        // Trường hợp 3: CÁC LỖI KHÁC (Lỗi kết nối MySQL, lỗi cú pháp, v.v.)
        // Tuyệt đối không trả về 403 để tránh Frontend hiểu nhầm và đá văng tài khoản.
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi hệ thống server khi xác minh người dùng. Hãy kiểm tra Logs!" 
        });
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