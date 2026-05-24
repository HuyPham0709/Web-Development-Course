const db = require('../config/db');

// 1. API Đăng tin tuyển dụng
exports.createJob = async (req, res) => {
    const {
        title, category_id, location_id,
        job_type, salary_min, salary_max,
        experience_level, description, requirements, benefits,
        status
    } = req.body;

    const posted_by = req.user.id;
    const company_id = req.user.company_id;

    if (!company_id) {
        return res.status(403).json({
            success: false,
            message: 'Tài khoản của bạn chưa được liên kết với công ty nào!'
        });
    }

    if (!title || !category_id || !location_id || !description) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng điền đầy đủ các trường bắt buộc!'
        });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO Jobs 
            (title, category_id, location_id, company_id, posted_by,
             job_type, salary_min, salary_max, experience_level,
             description, requirements, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, category_id, location_id, company_id, posted_by,
                job_type || 'full-time',
                salary_min || 0,
                salary_max || 0,
                experience_level || null,
                description,
                requirements || null,
                'pending'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Tin tuyển dụng đã được gửi và đang chờ kiểm duyệt!',
            jobId: result.insertId
        });
    } catch (error) {
        console.error('Lỗi createJob:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. API Lấy tất cả tin (cho Trang chủ)
// 2. API Lấy tất cả tin (cho Trang chủ)
exports.getAllJobs = async (req, res) => {
    try {
        const { title, location } = req.query;

        // SỬA Ở ĐÂY: Thêm GROUP_CONCAT(s.name) và LEFT JOIN bảng Skills
        let query = `
            SELECT j.*, 
                   c.name as company_name, 
                   c.logo_url, 
                   l.name as location_name,
                   GROUP_CONCAT(s.name SEPARATOR ',') as skills
            FROM Jobs j
            LEFT JOIN Companies c ON j.company_id = c.id
            LEFT JOIN Locations l ON j.location_id = l.id
            LEFT JOIN Job_Skills js ON j.id = js.job_id
            LEFT JOIN Skills s ON js.skill_id = s.id
            WHERE 1=1 
        `;

        const params = [];
        if (title) {
            query += ` AND (j.title LIKE ? OR j.description LIKE ?)`;
            params.push(`%${title}%`, `%${title}%`);
        }
        if (location) {
            query += ` AND l.name LIKE ?`;
            params.push(`%${location}%`);
        }

        // Bắt buộc phải có GROUP BY khi dùng hàm gộp GROUP_CONCAT
        query += ` GROUP BY j.id`;

        const [rows] = await db.execute(query, params);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi getAllJobs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Lấy chi tiết job
exports.getJobDetail = async (req, res) => {
    try {
        const jobId = req.params.id;

        const [jobs] = await db.execute(`
            SELECT j.*, 
                   c.name as company_name, c.logo_url, c.banner_url,
                   c.website, c.address as company_address, c.description as company_desc,
                   l.name as location_name,
                   cat.name as category_name
            FROM Jobs j
            LEFT JOIN Companies c ON j.company_id = c.id
            LEFT JOIN Locations l ON j.location_id = l.id
            LEFT JOIN Categories cat ON j.category_id = cat.id
            WHERE j.id = ?
        `, [jobId]);

        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy công việc!' });
        }

        res.status(200).json({ success: true, data: jobs[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update job
exports.updateJob = async (req, res) => {
    const jobId = req.params.id;
    const company_id = req.user.company_id;
    const {
        title, category_id, location_id,
        job_type, salary_min, salary_max,
        experience_level, description, requirements
    } = req.body;

    try {
        // Kiểm tra job thuộc công ty này không
        const [jobs] = await db.execute(
            'SELECT id FROM Jobs WHERE id = ? AND company_id = ? AND deleted_at IS NULL',
            [jobId, company_id]
        );
        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hoặc bạn không có quyền sửa tin này!' });
        }

        await db.execute(
            `UPDATE Jobs SET
                title = ?, category_id = ?, location_id = ?,
                job_type = ?, salary_min = ?, salary_max = ?,
                experience_level = ?, description = ?, requirements = ?,
                status = 'pending'
             WHERE id = ?`,
            [
                title, category_id, location_id,
                job_type || 'full-time',
                salary_min || 0,
                salary_max || 0,
                experience_level || null,
                description,
                requirements || null,
                jobId
            ]
        );

        res.status(200).json({ success: true, message: 'Cập nhật tin thành công! Tin đang chờ kiểm duyệt lại.' });
    } catch (error) {
        console.error('Lỗi updateJob:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete job (soft delete)
exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const company_id = req.user.company_id;
        const role = req.user.role;

        const [jobs] = await db.execute(
            'SELECT * FROM Jobs WHERE id = ? AND deleted_at IS NULL',
            [jobId]
        );
        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy công việc!' });
        }

        if (role !== 'admin' && jobs[0].company_id !== company_id) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa tin này!' });
        }

        await db.execute('UPDATE Jobs SET deleted_at = NOW() WHERE id = ?', [jobId]);
        res.status(200).json({ success: true, message: 'Đã xóa tin tuyển dụng!' });
    } catch (error) {
        console.error('Lỗi deleteJob:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getJobsByEmployer = async (req, res) => {
    try {
        const company_id = req.user.company_id;

        const [rows] = await db.execute(`
            SELECT 
                j.id, j.title, j.job_type, j.status, j.created_at,
                j.salary_min, j.salary_max, j.rejection_reason,
                l.name AS location_name,
                cat.name AS category_name,
                COUNT(a.id) AS application_count
            FROM Jobs j
            LEFT JOIN Locations l ON j.location_id = l.id
            LEFT JOIN Categories cat ON j.category_id = cat.id
            LEFT JOIN Applications a ON j.id = a.job_id
            WHERE j.company_id = ? AND j.deleted_at IS NULL
            GROUP BY j.id
            ORDER BY j.created_at DESC
        `, [company_id]);

        const total_jobs = rows.length;

        // Chỉ đếm applications của jobs đang approved
        const total_applications = rows.reduce((sum, row) => {
            if (row.status === 'approved') {
                return sum + (parseInt(row.application_count) || 0);
            }
            return sum;
        }, 0);

        res.status(200).json({
            success: true,
            data: rows,
            stats: { total_jobs, total_applications }
        });
    } catch (error) {
        console.error('Lỗi getJobsByEmployer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};