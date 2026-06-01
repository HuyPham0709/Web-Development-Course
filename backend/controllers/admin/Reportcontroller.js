const db = require('../../config/db'); // Đường dẫn cấp 2 đi từ controllers/admin/ ra config/db
const { createAdminNotification } = require("../admin/adminNotificationController");
const nodemailer = require('nodemailer');
const emailUser = "txxh1004@gmail.com";
const emailPass = "wrwvarvgrqlkhjwq";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass }
});

// =======================================================
// 1. DÀNH CHO ỨNG VIÊN: Tạo báo cáo vi phạm công việc (MỚI BỔ SUNG)
// =======================================================
exports.createReport = async (req, res) => {
    try {
        const { job_id, reason } = req.body;
        const reporter_id = req.user.id; // Lấy ID của người dùng từ token đăng nhập

        if (!job_id || !reason) {
            return res.status(400).json({ success: false, message: "Missing job information or reason for reporting." });
        }

        const [result] = await db.execute(
            'INSERT INTO Reports (reporter_id, job_id, reason, status) VALUES (?, ?, ?, "pending")',
            [reporter_id, job_id, reason]
        );
        const [jobRows] = await db.execute(
            `SELECT j.title, u.username 
     FROM Jobs j, Users u 
     WHERE j.id = ? AND u.id = ?`,
            [job_id, reporter_id]
        );
        const jobTitle = jobRows[0]?.title || `Job #${job_id}`;
        const reporterName = jobRows[0]?.username || `User #${reporter_id}`;

        await createAdminNotification({
            title: "🚨 New Violation Report",
            message: `${reporterName} reported job: "${jobTitle}" for: "${reason}"`,
            link_url: `/reports`
        });

        return res.status(201).json({
            success: true,
            message: "Report submitted successfully! The administration will review it soon."
        });
    } catch (error) {
        console.error("Error in createReport:", error);
        return res.status(500).json({ success: false, message: "System error: Unable to submit report." });
    }
};

// =======================================================
// 2. DÀNH CHO ADMIN: Lấy danh sách kèm phân loại và thống kê số liệu
// =======================================================
exports.getReports = async (req, res) => {
    try {
        const { status, search } = req.query;

        // --- BƯỚC 1: LẤY THÔNG TIN THỐNG KÊ (STATS) THEO ĐÚNG ĐỊNH DẠNG FE CẦN ---
        const [statsRows] = await db.execute(`
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS total_pending,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS total_resolved,
                SUM(CASE WHEN status = 'ignored' THEN 1 ELSE 0 END) AS total_ignored
            FROM Reports
        `);

        const stats = {
            total: Number(statsRows[0].total || 0),
            total_pending: Number(statsRows[0].total_pending || 0),
            total_resolved: Number(statsRows[0].total_resolved || 0),
            total_ignored: Number(statsRows[0].total_ignored || 0)
        };

        // --- BƯỚC 2: XÂY DỰNG QUERY JOIN ĐỂ LẤY ĐẦY ĐỦ THÔNG TIN CHI TIẾT ---
        let query = `
            SELECT 
                r.id,
                r.reason,
                r.status,
                r.created_at,
                r.job_id,
                j.title AS job_title,
                j.status AS job_status,
                c.name AS company_name,
                r.reporter_id,
                u.username AS reporter_username,
                u.email AS reporter_email
            FROM Reports r
            INNER JOIN Jobs j ON r.job_id = j.id
            INNER JOIN Companies c ON j.company_id = c.id
            INNER JOIN Users u ON r.reporter_id = u.id
            WHERE 1=1
        `;

        const queryParams = [];

        // Lọc theo trạng thái tin báo cáo (pending, resolved, ignored)
        if (status && status !== 'all') {
            query += ` AND r.status = ?`;
            queryParams.push(status);
        }

        // Tìm kiếm theo tiêu đề job hoặc thông tin người gửi báo cáo
        if (search) {
            query += ` AND (j.title LIKE ? OR u.username LIKE ? OR u.email LIKE ? OR r.reason LIKE ?)`;
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        // Sắp xếp báo cáo mới nhất lên đầu
        query += ` ORDER BY r.created_at DESC`;

        const [reports] = await db.execute(query, queryParams);

        // Trả về cấu trúc JSON chuẩn mực mà Frontend đang bóc tách (.data và .stats)
        return res.status(200).json({
            success: true,
            data: reports,
            stats: stats
        });
    } catch (error) {
        console.error('Error in getReports:', error);
        return res.status(500).json({ success: false, message: 'Server error when fetching violation reports.' });
    }
};

// =======================================================
// 3. DÀNH CHO ADMIN: Cập nhật trạng thái báo cáo (Resolved / Ignored)
// =======================================================
exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await db.execute('UPDATE Reports SET status = ? WHERE id = ?', [status, id]);

        return res.status(200).json({ success: true, message: 'Status updated successfully.' });
    } catch (error) {
        console.error("Error in updateReportStatus:", error);
        return res.status(500).json({ success: false, message: "System error while updating status." });
    }
};

// =======================================================
// 4. DÀNH CHO ADMIN: Xóa/Gỡ bỏ bài đăng vi phạm (Khóa Job)
// =======================================================
exports.deleteReportedJob = async (req, res) => {
    try {
        const { id } = req.params;

        const [reportRows] = await db.execute(
            'SELECT job_id FROM Reports WHERE id = ?', [id]
        );
        if (reportRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found.'
            });
        }

        const jobId = reportRows[0].job_id;

        // Lấy thông tin job + employer để gửi mail
        const [jobRows] = await db.execute(
            `SELECT j.title, u.email, u.username 
             FROM Jobs j JOIN Users u ON j.posted_by = u.id 
             WHERE j.id = ?`,
            [jobId]
        );

        await db.execute("UPDATE Jobs SET status = 'banned' WHERE id = ?", [jobId]);
        await db.execute("UPDATE Reports SET status = 'resolved' WHERE job_id = ?", [jobId]);

        // Gửi mail cho employer
        if (jobRows.length > 0) {
            const { title, email, username } = jobRows[0];
            await transporter.sendMail({
                from: `"JobSpot Admin" <${emailUser}>`,
                to: email,
                subject: "⛔ Your job posting has been banned",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <div style="background: #dc2626; padding: 20px 24px;">
                            <h2 style="color: white; margin: 0;">⛔ Job Posting Banned</h2>
                        </div>
                        <div style="padding: 24px;">
                            <p>Hello <strong>${username}</strong>,</p>
                            <p>Your job posting <strong>"${title}"</strong> has been banned by our admin team due to a violation report.</p>
                            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
                                <p style="margin: 0;"><strong>Reason:</strong> Violated platform terms of service based on user reports.</p>
                            </div>
                            <p>If you believe this is a mistake, please contact our support team.</p>
                            <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">Best regards,<br/>JobSpot Admin Team</p>
                        </div>
                    </div>
                `
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Job banned and employer notified.'
        });
    } catch (error) {
        console.error('Error in deleteReportedJob:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while processing job removal.'
        });
    }
};