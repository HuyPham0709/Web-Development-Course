const db = require('../../config/db'); // Đường dẫn cấp 2 đi từ controllers/admin/ ra config/db
const { createAdminNotification } = require("../admin/adminNotificationController");

// =======================================================
// 1. DÀNH CHO ỨNG VIÊN: Tạo báo cáo vi phạm công việc (MỚI BỔ SUNG)
// =======================================================
exports.createReport = async (req, res) => {
    try {
        const { job_id, reason } = req.body;
        const reporter_id = req.user.id; // Lấy ID của người dùng từ token đăng nhập

        if (!job_id || !reason) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin job hoặc lý do báo cáo." });
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
            message: "Gửi báo cáo vi phạm thành công! Ban quản trị sẽ sớm xem xét."
        });
    } catch (error) {
        console.error("Lỗi createReport:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống không thể gửi báo cáo." });
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
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách báo cáo vi phạm.' });
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

        return res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công.' });
    } catch (error) {
        console.error("Lỗi updateReportStatus:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật trạng thái." });
    }
};

// =======================================================
// 4. DÀNH CHO ADMIN: Xóa/Gỡ bỏ bài đăng vi phạm (Khóa Job)
// =======================================================
exports.deleteReportedJob = async (req, res) => {
    try {
        const { id } = req.params;

        // Truy vết tìm ra mã công việc (job_id) từ ID của báo cáo
        const [reportRows] = await db.execute(
            'SELECT job_id FROM Reports WHERE id = ?',
            [id]
        );

        if (reportRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bản ghi báo cáo này.'
            });
        }

        const jobId = reportRows[0].job_id;

        // Thay vì xóa cứng làm mất toàn bộ liên kết dữ liệu, chuyển trạng thái tin tuyển dụng sang 'closed'
        await db.execute(
            "UPDATE Jobs SET status = 'closed' WHERE id = ?",
            [jobId]
        );

        // Tự động chuyển toàn bộ các báo cáo khác liên kết với tin tuyển dụng này thành 'resolved'
        await db.execute(
            "UPDATE Reports SET status = 'resolved' WHERE job_id = ?",
            [jobId]
        );

        return res.status(200).json({
            success: true,
            message: 'Đã gỡ bỏ bài đăng vi phạm và cập nhật trạng thái các báo cáo liên quan.'
        });

    } catch (error) {
        console.error('Error in deleteReportedJob:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi xử lý gỡ bài đăng.'
        });
    }
};