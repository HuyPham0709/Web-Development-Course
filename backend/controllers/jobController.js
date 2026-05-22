const db = require('../config/db');

// 1. API Đăng tin tuyển dụng
exports.createJob = async (req, res) => {
    const {
        title, category_id, location_id, company_id,
        job_type, salary_range, experience_level, description
    } = req.body;

    try {
        // Trong thực tế, bạn nên check xem user này có quyền quản lý company_id này không
        const [result] = await db.execute(
            `INSERT INTO Jobs 
            (title, category_id, location_id, company_id, job_type, salary_range, experience_level, description, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [title, category_id, location_id, company_id, job_type, salary_range, experience_level, description]
        );

        res.status(201).json({
            success: true,
            message: "Tin tuyển dụng đã được gửi và chờ kiểm duyệt!",
            jobId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        console.error("Lỗi getAllJobs:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getJobDetail = async (req, res) => {
    try {
        const jobId = req.params.id;

        const jobQuery = `
            SELECT j.*, 
                   c.name as company_name, c.logo_url, c.banner_url, c.website, c.address as company_address, c.description as company_desc,
                   l.name as location_name,
                   cat.name as category_name
            FROM Jobs j
            LEFT JOIN Companies c ON j.company_id = c.id
            LEFT JOIN Locations l ON j.location_id = l.id
            LEFT JOIN Categories cat ON j.category_id = cat.id
            WHERE j.id = ?
        `; // Đã đổi thành LEFT JOIN và bỏ điều kiện status để bạn test dữ liệu
        
        const [jobs] = await db.execute(jobQuery, [jobId]);

        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy công việc!' });
        }

        const job = jobs[0];
        // ... (phần lấy skills giữ nguyên)
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};