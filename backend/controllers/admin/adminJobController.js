const db = require('../../config/db');

// 1. Lấy tất cả jobs (cho trang Job Management)
// 1. Lấy tất cả jobs (cho trang Job Management)
exports.getAllJobs = async (req, res) => {
    const { status, job_type, experience_level, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        let where = ['j.deleted_at IS NULL'];
        let params = [];

        if (status && status !== 'all') {
            where.push('j.status = ?');
            params.push(status);
        }
        if (job_type) {
            where.push('j.job_type = ?');
            params.push(job_type);
        }
        if (experience_level) {
            where.push('j.experience_level = ?');
            params.push(experience_level);
        }
        if (search) {
            where.push('(j.title LIKE ? OR c.name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = 'WHERE ' + where.join(' AND ');

        // PHẦN ĐÃ SỬA: Đưa trực tiếp ${limit} và ${offset} vào câu lệnh SQL và xóa khỏi mảng params phía dưới
        const [jobs] = await db.execute(`
            SELECT
                j.id, j.title, j.job_type, j.experience_level,
                j.salary_min, j.salary_max, j.status, j.created_at,
                c.name AS company_name,
                l.name AS location_name,
                cat.name AS category_name
            FROM Jobs j
            JOIN Companies  c   ON j.company_id  = c.id
            JOIN Locations  l   ON j.location_id = l.id
            JOIN Categories cat ON j.category_id = cat.id
            ${whereClause}
            ORDER BY j.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `, params);

        const [countResult] = await db.execute(`
            SELECT COUNT(*) AS total
            FROM Jobs j
            JOIN Companies c ON j.company_id = c.id
            ${whereClause}
        `, params);

        // Stats tổng quan
        const [stats] = await db.execute(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS total_approved,
                SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS total_pending,
                SUM(CASE WHEN status = 'closed'   THEN 1 ELSE 0 END) AS total_closed,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS total_rejected,
                SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) AS total_banned
            FROM Jobs
            WHERE deleted_at IS NULL
        `);

        res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                total: countResult[0].total,
                page,
                limit,
                totalPages: Math.ceil(countResult[0].total / limit)
            },
            stats: stats[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// 2. Xóa job (soft delete)
exports.deleteJob = async (req, res) => {
    const { job_id } = req.params;
    try {
        const [result] = await db.execute(
            "UPDATE Jobs SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL"
            [job_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin tuyển dụng' });
        }
        res.status(200).json({ success: true, message: 'Đã xóa tin tuyển dụng' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Lấy danh sách jobs chờ duyệt (pending queue)
exports.getPendingJobs = async (req, res) => {
    try {
        const [jobs] = await db.execute(`
            SELECT
                j.id, j.title, j.description, j.requirements,
                j.job_type, j.experience_level,
                j.salary_min, j.salary_max,
                j.status, j.created_at,
                c.id   AS company_id,
                c.name AS company_name,
                c.logo_url, c.address, c.is_verified AS company_verified,
                l.name AS location_name,
                cat.name AS category_name,
                u.username AS posted_by_username,
                u.email    AS posted_by_email
            FROM Jobs j
            JOIN Companies  c   ON j.company_id   = c.id
            JOIN Locations  l   ON j.location_id  = l.id
            JOIN Categories cat ON j.category_id  = cat.id
            JOIN Users      u   ON j.posted_by    = u.id
            WHERE j.status = 'pending' AND j.deleted_at IS NULL
            ORDER BY j.created_at ASC
        `);
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Approve job
exports.approveJob = async (req, res) => {
    const { job_id } = req.params;
    try {
        const [jobs] = await db.execute(
            "SELECT id, title, status FROM Jobs WHERE id = ? AND deleted_at IS NULL",
            [job_id]
        );
        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: "No job postings found.!" });
        }
        if (jobs[0].status !== 'pending') {
            return res.status(400).json({ success: false, message: `This news is currently in this state. "${jobs[0].status}", unreadable!` });
        }
        await db.execute("UPDATE Jobs SET status = 'approved' WHERE id = ?", [job_id]);
        res.status(200).json({ success: true, message: "Job posting has been successfully approved.!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Reject job
exports.rejectJob = async (req, res) => {
    const { job_id } = req.params;
    const { reason } = req.body;

    try {
        const [jobs] = await db.execute(
            "SELECT id, title, status FROM Jobs WHERE id = ? AND deleted_at IS NULL",
            [job_id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: "No job postings found.!" });
        }

        if (jobs[0].status !== 'pending') {
            return res.status(400).json({ success: false, message: `This news is currently in this state. "${jobs[0].status}", unreadable!` });
        }

        // ← Lưu rejection_reason vào cột mới
        await db.execute(
            "UPDATE Jobs SET status = 'rejected', rejection_reason = ? WHERE id = ?",
            [reason || null, job_id]
        );

        res.status(200).json({ success: true, message: "Job posting has been successfully rejected.!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Stats tổng quan
exports.getJobStats = async (req, res) => {
    try {
        const [stats] = await db.execute(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS total_pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS total_approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS total_rejected,
                SUM(CASE WHEN status = 'closed'   THEN 1 ELSE 0 END) AS total_closed
            FROM Jobs WHERE deleted_at IS NULL
        `);
        res.status(200).json({ success: true, data: stats[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [THÊM MỚI] 7. Xóa nhiều Job hàng loạt (Bulk Delete)
exports.bulkDeleteJobs = async (req, res) => {
    const { ids } = req.body; // Mảng chứa các ID cần xóa, ví dụ: [232, 233]
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid ID list' });
    }

    try {
        const [result] = await db.execute(
            `UPDATE Jobs SET deleted_at = NOW()
 WHERE id IN (${ids.map(() => '?').join(',')}) AND deleted_at IS NULL`,
            ids
        );
        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.affectedRows} job postings`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [THÊM MỚI] 8. Nhân bản tin tuyển dụng (Duplicate)
exports.duplicateJob = async (req, res) => {
    const { job_id } = req.params;
    try {
        // Lấy thông tin bản gốc cũ
        const [jobs] = await db.execute(
            "SELECT * FROM Jobs WHERE id = ? AND deleted_at IS NULL",
            [job_id]
        );
        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'No job postings found.!' });
        }

        const original = jobs[0];
        // Nhân bản dữ liệu với tiêu đề mới kèm hậu tố Copy
        const [result] = await db.execute(`
            INSERT INTO Jobs (
                title, description, requirements, company_id, location_id, category_id,
                job_type, experience_level, salary_min, salary_max, status, posted_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
        `, [
            `${original.title} (Copy)`, original.description, original.requirements,
            original.company_id, original.location_id, original.category_id,
            original.job_type, original.experience_level, original.salary_min,
            original.salary_max, original.posted_by
        ]);

        res.status(201).json({
            success: true,
            message: 'Successfully duplicated the job posting!',
            insertId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [THÊM MỚI] 9. Xuất danh sách CSV lọc theo điều kiện (Export CSV)
exports.exportJobsCSV = async (req, res) => {
    const { status, job_type, experience_level, search } = req.query;
    try {
        let where = ['j.deleted_at IS NULL'];
        let params = [];

        if (status && status !== 'all') { where.push('j.status = ?'); params.push(status); }
        if (job_type) { where.push('j.job_type = ?'); params.push(job_type); }
        if (experience_level) { where.push('j.experience_level = ?'); params.push(experience_level); }
        if (search) {
            where.push('(j.title LIKE ? OR c.name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = 'WHERE ' + where.join(' AND ');
        const [jobs] = await db.execute(`
            SELECT j.id, j.title, j.job_type, j.experience_level, j.salary_min, j.salary_max, j.status,
                   c.name AS company_name, l.name AS location_name, cat.name AS category_name, j.created_at
            FROM Jobs j
            JOIN Companies c ON j.company_id = c.id
            JOIN Locations l ON j.location_id = l.id
            JOIN Categories cat ON j.category_id = cat.id
            ${whereClause} ORDER BY j.created_at DESC
        `, params);

        // Tạo nội dung file CSV thủ công kết hợp UTF-8 BOM chống lỗi font tiếng Việt trên Excel
        let csvContent = "\uFEFFID,Title, Company, Job Type, Experience, Minimum Salary, Maximum Salary, Status, Creation Date\n";
        jobs.forEach(row => {
            csvContent += `${row.id},"${row.title.replace(/"/g, '""')}","${row.company_name.replace(/"/g, '""')}",${row.job_type},${row.experience_level},${row.salary_min},${row.salary_max},${row.status},${row.created_at}\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=jobs_export.csv');
        return res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 1. Lấy chi tiết Job bằng ID (Dành cho trang View Details)
// ==========================================
exports.getJobById = async (req, res) => {
    const { job_id } = req.params;
    try {
        const [jobs] = await db.execute(`
            SELECT j.*, 
                   c.name AS company_name, 
                   l.name AS location_name, 
                   cat.name AS category_name
            FROM Jobs j
            JOIN Companies c ON j.company_id = c.id
            JOIN Locations l ON j.location_id = l.id
            JOIN Categories cat ON j.category_id = cat.id
            WHERE j.id = ? AND j.deleted_at IS NULL
        `, [job_id]);

        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'No job posting found.!' });
        }

        res.status(200).json({ success: true, data: jobs[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database connection error: " + error.message });
    }
};

// ==========================================
// 2. Cập nhật chi tiết Job (Dành cho trang lưu Edit Job)
// ==========================================
exports.updateJob = async (req, res) => {
    const { job_id } = req.params;
    const { title, description, requirements, benefit, salary_min, salary_max, status } = req.body;

    try {
        // Đồng bộ chuẩn xác toàn bộ các trường text, số và enum từ Frontend truyền lên
        const [result] = await db.execute(`
            UPDATE Jobs 
            SET title = ?, 
                description = ?, 
                requirements = ?, 
                benefit = ?, 
                salary_min = ?, 
                salary_max = ?, 
                status = ?
            WHERE id = ? AND deleted_at IS NULL
        `, [title, description, requirements, benefit, salary_min, salary_max, status, job_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Unable to update, job posting does not exist' });
        }

        res.status(200).json({ success: true, message: 'Job information has been successfully updated!' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error while updating: " + error.message });
    }
};