const db = require('../../config/db');
const nodemailer = require('nodemailer');
const emailUser = "txxh1004@gmail.com";
const emailPass = "wrwvarvgrqlkhjwq";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass }
});

// ================= LẤY DANH SÁCH USERS =================
exports.getUsers = async (req, res) => {
    const { role, status, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        let where = ['u.deleted_at IS NULL', "u.role != 'admin'"];
        let params = [];

        if (role) {
            where.push('u.role = ?');
            params.push(role);
        }

        if (status === 'banned') {
            where.push('u.is_active = 0');
        } else if (status === 'active') {
            where.push('u.is_active = 1');
        } else if (status === 'pending') {
            where.push("u.role = 'employer' AND c.is_verified = 0 AND u.is_active = 1");
        }

        if (search) {
            where.push('(u.username LIKE ? OR u.email LIKE ? OR u.display_name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

        const [rows] = await db.execute(`
            SELECT
                u.id,
                u.username,
                u.display_name,
                u.email,
                u.role,
                u.is_active,
                u.is_verified,
                u.created_at,
                c.id AS company_id,
                c.name AS company_name,
                c.is_verified AS company_verified
            FROM Users u
            LEFT JOIN Companies c ON u.company_id = c.id
            ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ${Number(limit)} OFFSET ${Number(offset)} 
        `, params);

        // Query đếm tổng
        const [countResult] = await db.execute(`
            SELECT COUNT(*) AS total
            FROM Users u
            LEFT JOIN Companies c ON u.company_id = c.id
            ${whereClause}
        `, params);

        // Stats tổng quan
        const [stats] = await db.execute(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN role = 'candidate' THEN 1 ELSE 0 END) AS total_candidates,
                SUM(CASE WHEN role = 'employer' THEN 1 ELSE 0 END) AS total_employers,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS total_banned
            FROM Users
            WHERE deleted_at IS NULL AND role != 'admin'
        `);

        const [pendingCount] = await db.execute(`
            SELECT COUNT(*) AS total_pending
            FROM Users u
            LEFT JOIN Companies c ON u.company_id = c.id
            WHERE u.role = 'employer' AND c.is_verified = 0
              AND u.is_active = 1 AND u.deleted_at IS NULL
        `);

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: countResult[0].total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(countResult[0].total / limit)
            },
            stats: {
                ...stats[0],
                total_pending: pendingCount[0].total_pending
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= BAN / UNBAN USER =================
exports.toggleBanUser = async (req, res) => {
    const { user_id } = req.params;
    const { reason } = req.body;

    try {
        const [users] = await db.execute(
            "SELECT id, username, email, is_active, role FROM Users WHERE id = ? AND deleted_at IS NULL",
            [user_id]
        );

        if (users.length === 0)
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });

        const user = users[0];

        if (user.role === 'admin')
            return res.status(403).json({ success: false, message: "Không thể ban tài khoản Admin!" });

        const newStatus = user.is_active ? 0 : 1;
        if (newStatus === 0) {
            const banReason = reason?.trim() || "Vi phạm điều khoản sử dụng dịch vụ.";
            await db.execute(
                "UPDATE Users SET is_active = ?, ban_reason = ? WHERE id = ?",
                [newStatus, banReason, user_id]
            );
        } else {
            // Khi unban thì xóa lý do ban
            await db.execute(
                "UPDATE Users SET is_active = ?, ban_reason = NULL WHERE id = ?",
                [newStatus, user_id]
            );
        }

        // Gửi email thông báo khi BAN (không gửi khi unban)
        if (newStatus === 0) {
            const banReason = reason?.trim() || "Vi phạm điều khoản sử dụng dịch vụ.";
            await transporter.sendMail({
                from: `"JobSpot Admin" <${emailUser}>`,
                to: user.email,
                subject: "⚠️ Tài khoản của bạn đã bị tạm khóa",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <div style="background: #dc2626; padding: 20px 24px;">
                            <h2 style="color: white; margin: 0;">⚠️ Tài khoản bị tạm khóa</h2>
                        </div>
                        <div style="padding: 24px;">
                            <p>Xin chào <strong>${user.username}</strong>,</p>
                            <p>Tài khoản của bạn trên <strong>JobSpot</strong> đã bị tạm khóa bởi quản trị viên.</p>
                            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
                                <p style="margin: 0;"><strong>Lý do:</strong> ${banReason}</p>
                            </div>
                            <p>Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ để được giải quyết.</p>
                            <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">Trân trọng,<br/>Đội ngũ JobSpot</p>
                        </div>
                    </div>
                `
            });
        }

        const action = newStatus === 0 ? 'banned' : 'unbanned';
        console.log(`[ADMIN] User ${user.username} (ID: ${user_id}) ${action}. Reason: ${reason || 'N/A'}`);

        res.status(200).json({
            success: true,
            message: newStatus === 0
                ? `Đã ban tài khoản ${user.username} và gửi email thông báo.`
                : `Đã mở ban tài khoản ${user.username}`,
            new_status: newStatus === 1 ? 'active' : 'banned'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= VERIFY COMPANY =================
exports.verifyCompany = async (req, res) => {
    const { user_id } = req.params;

    try {
        const [users] = await db.execute(
            "SELECT u.id, u.username, u.company_id, c.name AS company_name, c.is_verified FROM Users u LEFT JOIN Companies c ON u.company_id = c.id WHERE u.id = ?",
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
        }

        const user = users[0];

        if (!user.company_id) {
            return res.status(400).json({ success: false, message: "Người dùng này chưa có công ty!" });
        }

        if (user.is_verified) {
            return res.status(400).json({ success: false, message: "Công ty này đã được xác minh rồi!" });
        }

        await db.execute("UPDATE Companies SET is_verified = 1 WHERE id = ?", [user.company_id]);

        console.log(`[ADMIN] Company "${user.company_name}" (ID: ${user.company_id}) verified`);

        res.status(200).json({
            success: true,
            message: `Đã xác minh công ty "${user.company_name}" thành công!`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= XEM CHI TIẾT USER =================
exports.getUserDetail = async (req, res) => {
    const { user_id } = req.params;

    try {
        const [users] = await db.execute(`
            SELECT
                u.id, u.username, u.display_name, u.email, u.role,
                u.is_active, u.is_verified, u.avatar_url, u.created_at,
                u.ban_reason,
                c.id AS company_id, c.name AS company_name,
                c.is_verified AS company_verified, c.website, c.address,
                p.full_name, p.phone, p.bio
            FROM Users u
            LEFT JOIN Companies c ON u.company_id = c.id
            LEFT JOIN Profiles p ON u.id = p.user_id
            WHERE u.id = ?
        `, [user_id]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
        }

        // Thống kê thêm tùy role
        let extra = {};
        if (users[0].role === 'candidate') {
            const [appCount] = await db.execute(
                "SELECT COUNT(*) AS total FROM Applications WHERE candidate_id = ?",
                [user_id]
            );
            extra.total_applications = appCount[0].total;
        } else if (users[0].role === 'employer') {
            const [jobCount] = await db.execute(
                "SELECT COUNT(*) AS total FROM Jobs WHERE posted_by = ? AND deleted_at IS NULL",
                [user_id]
            );
            extra.total_jobs = jobCount[0].total;
        }

        res.status(200).json({ success: true, data: { ...users[0], ...extra } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};