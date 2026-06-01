const db = require('../../config/db');
const { createAdminNotification } = require("../admin/adminNotificationController");

// 1. API Đăng tin tuyển dụng
exports.createJob = async (req, res) => {
    const {
        title, category_id, location_id,
        job_type, salary_min, salary_max,
        experience_level, description, requirements, benefits,
        status,
        skills // <--- Đổi thành skills (nhận mảng tên kỹ năng, VD: ['React', 'NodeJS'])
    } = req.body;

    const posted_by = req.user.id;
    const company_id = req.user.company_id;

    if (!company_id) {
        return res.status(403).json({
            success: false,
            message: 'Your account is not linked to any company!'
        });
    }

    if (!title || !category_id || !location_id || !description) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all required fields!'
        });
    }

    try {
        // 1. Chèn dữ liệu vào bảng Jobs như cũ
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

        const newJobId = result.insertId;

        // 2. THÊM MỚI: Chuyển đổi tên kỹ năng thành ID và chèn vào Job_Skills
        if (skills && Array.isArray(skills) && skills.length > 0) {
            // Tạo chuỗi dấu '?' tương ứng với số lượng skill
            const placeholders = skills.map(() => '?').join(',');

            // Tìm ID của các skill có tên nằm trong mảng skills
            const [skillRows] = await db.execute(`SELECT id FROM Skills WHERE name IN (${placeholders})`, skills);

            if (skillRows.length > 0) {
                const insertValues = [];
                const valuePlaceholders = skillRows.map(row => {
                    insertValues.push(newJobId, row.id);
                    return '(?, ?)';
                }).join(', ');

                await db.execute(
                    `INSERT IGNORE INTO Job_Skills (job_id, skill_id) VALUES ${valuePlaceholders}`,
                    insertValues
                );
            }
        }

        const [companyRows] = await db.execute('SELECT name FROM Companies WHERE id = ?', [company_id]);
        const companyName = companyRows[0]?.name || 'The employer';

        await createAdminNotification({
            title: "📋 New job awaiting approval.",
            message: `${companyName} just posted a job: "${title}"`,
            link_url: `/jobs/management`
        });

        res.status(201).json({
            success: true,
            message: 'Job posting submitted and is pending review!',
            jobId: newJobId
        });
    } catch (error) {
        console.error('Lỗi createJob:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. API Lấy tất cả tin (cho Trang chủ & Trang tìm kiếm - Fix lỗi phân trang)
exports.getAllJobs = async (req, res) => {
    try {
        const {
            title, location, category_id, type, experience_level, salary_min, salary,
            page, limit, company_id, sort
        } = req.query;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 12;
        const offsetNum = (pageNum - 1) * limitNum;

        let whereClause = ` WHERE j.deleted_at IS NULL AND j.status = 'approved'`;
        const params = [];

        if (company_id) {
            whereClause += ` AND j.company_id = ?`;
            params.push(company_id);
        }
        if (title) {
            whereClause += ` AND j.title LIKE ?`;
            params.push(`%${title}%`);
        }
        if (location) {
            whereClause += ` AND l.name LIKE ?`;
            params.push(`%${location}%`);
        }
        if (category_id) {
            whereClause += ` AND j.category_id = ?`;
            params.push(category_id);
        }
        if (type) {
            whereClause += ` AND j.job_type = ?`;
            params.push(type);
        }
        if (experience_level) {
            whereClause += ` AND j.experience_level = ?`;
            params.push(experience_level);
        }

        if (salary_min && Number(salary_min) > 0) {
            whereClause += ` AND j.salary_max >= ?`;
            params.push(Number(salary_min));
        }

        if (salary) {
            if (salary.includes('-')) {
                const parts = salary.split('-');
                const minS = parseInt(parts[0], 10) || 0;
                const maxS = parseInt(parts[1], 10) || 99999999;
                whereClause += ` AND j.salary_max >= ? AND j.salary_min <= ?`;
                params.push(minS, maxS);
            } else if (salary.includes('+')) {
                const minS = parseInt(salary.replace('+', ''), 10) || 0;
                whereClause += ` AND j.salary_max >= ?`;
                params.push(minS);
            }
        }

        // 🌟 TỐI ƯU LOGIC SẮP XẾP (ORDER BY) AN TOÀN
        let orderByClause = `ORDER BY j.created_at DESC`; // Mặc định là mới nhất

        if (sort) {
            switch (sort) {
                case 'salary_desc':
                    // Ưu tiên lương max lớn nhất -> lương min lớn nhất -> ngày đăng mới nhất
                    orderByClause = `ORDER BY j.salary_max DESC, j.salary_min DESC, j.created_at DESC`;
                    break;
                case 'salary_asc':
                    orderByClause = `ORDER BY j.salary_min ASC, j.salary_max ASC, j.created_at DESC`;
                    break;
                case 'oldest':
                    orderByClause = `ORDER BY j.created_at ASC`;
                    break;
                // Có thể thêm các case khác trong tương lai ở đây
                default:
                    // Giữ nguyên mặc định nếu sort gửi lên không hợp lệ
                    break;
            }
        }

        let countQuery = `
            SELECT COUNT(DISTINCT j.id) as total 
            FROM Jobs j
            LEFT JOIN Locations l ON j.location_id = l.id
            ${whereClause}
        `;
        const [countRows] = await db.execute(countQuery, params);
        const totalItems = countRows[0].total;

        // 🌟 ÁP DỤNG CÂU LỆNH ORDER BY ĐỘNG VÀO QUERY
        let dataQuery = `
            SELECT 
                j.id, j.title, j.job_type, j.experience_level, 
                j.salary_min, j.salary_max, j.created_at, j.status,
                j.company_id, 
                c.name as company_name, 
                c.logo_url, 
                c.is_verified,
                l.name as location_name,
                GROUP_CONCAT(s.name SEPARATOR ',') as skills
            FROM Jobs j
            LEFT JOIN Companies c ON j.company_id = c.id
            LEFT JOIN Locations l ON j.location_id = l.id
            LEFT JOIN Job_Skills js ON j.id = js.job_id
            LEFT JOIN Skills s ON js.skill_id = s.id
            ${whereClause}
            GROUP BY j.id 
            ${orderByClause} /* <--- ĐÃ THAY THẾ ORDER BY CỨNG BẰNG BIẾN */
            LIMIT ${limitNum} OFFSET ${offsetNum}
        `;

        const [rows] = await db.execute(dataQuery, params);
        const hasMore = offsetNum + rows.length < totalItems;

        res.status(200).json({
            success: true,
            data: rows,
            meta: {
                page: pageNum,
                limit: limitNum,
                total: totalItems,
                hasMore: hasMore
            }
        });
    } catch (error) {
        console.error('Detailed error information at getAllJobs:', error);
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
                   cat.name as category_name,
                   GROUP_CONCAT(s.name SEPARATOR ',') as skills -- <--- THÊM: Gộp tên kĩ năng thành chuỗi
            FROM Jobs j
            LEFT JOIN Companies c ON j.company_id = c.id
            LEFT JOIN Locations l ON j.location_id = l.id
            LEFT JOIN Categories cat ON j.category_id = cat.id
            LEFT JOIN Job_Skills js ON j.id = js.job_id        -- <--- THÊM: Kết hợp bảng trung gian
            LEFT JOIN Skills s ON js.skill_id = s.id           -- <--- THÊM: Kết hợp bảng kĩ năng
            WHERE j.id = ?
            GROUP BY j.id                                      -- <--- THÊM: Group by ID để gom nhóm GROUP_CONCAT
        `, [jobId]);

        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found!' });
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
        experience_level, description, requirements,
        skills // <--- Đổi thành skills (nhận mảng tên kỹ năng mới)
    } = req.body;

    try {
        // Kiểm tra job thuộc công ty này không
        const [jobs] = await db.execute(
            'SELECT id FROM Jobs WHERE id = ? AND company_id = ? AND deleted_at IS NULL',
            [jobId, company_id]
        );
        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found or you do not have permission to edit this job!' });
        }

        // 1. Cập nhật thông tin bảng Jobs
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

        // 2. THÊM MỚI: Đồng bộ lại danh sách kĩ năng mới bằng cách map từ Tên sang ID
        if (skills && Array.isArray(skills)) {
            // Bước A: Xóa bỏ tất cả kĩ năng cũ liên kết với job này
            await db.execute('DELETE FROM Job_Skills WHERE job_id = ?', [jobId]);

            // Bước B: Nếu mảng mới có phần tử, thực hiện query lấy ID và chèn vào
            if (skills.length > 0) {
                const placeholders = skills.map(() => '?').join(',');
                const [skillRows] = await db.execute(`SELECT id FROM Skills WHERE name IN (${placeholders})`, skills);

                if (skillRows.length > 0) {
                    const insertValues = [];
                    const valuePlaceholders = skillRows.map(row => {
                        insertValues.push(jobId, row.id);
                        return '(?, ?)';
                    }).join(', ');

                    await db.execute(
                        `INSERT IGNORE INTO Job_Skills (job_id, skill_id) VALUES ${valuePlaceholders}`,
                        insertValues
                    );
                }
            }
        }

        const [companyRows] = await db.execute('SELECT name FROM Companies WHERE id = ?', [company_id]);
        const companyName = companyRows[0]?.name || 'The employer';
        await createAdminNotification({
            title: "✏️ Job updated",
            message: `${companyName} just edited the job: "${title}", needs review.`,
            link_url: `/jobs/management`
        });

        res.status(200).json({ success: true, message: 'Job updated successfully! The job is pending review.' });
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
            return res.status(404).json({ success: false, message: 'Job not found!' });
        }

        if (role !== 'admin' && jobs[0].company_id !== company_id) {
            return res.status(403).json({ success: false, message: 'You do not have permission to delete this job!' });
        }

        await db.execute('UPDATE Jobs SET deleted_at = NOW() WHERE id = ?', [jobId]);
        res.status(200).json({ success: true, message: 'Job deleted successfully!' });
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
exports.getSuggestions = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === '') {
            return res.json({ success: true, data: [] });
        }

        const searchQuery = `%${q}%`;

        const sql = `
            SELECT 
                j.id AS id, 
                j.title AS label, 
                c.name AS description
            FROM Jobs j
            LEFT JOIN Companies c ON j.company_id = c.id
            WHERE j.status = 'approved' 
              AND j.deleted_at IS NULL 
              AND j.title LIKE ?
            LIMIT 10
        `;

        const [rows] = await db.execute(sql, [searchQuery]);

        // ĐỒNG BỘ CHUẨN: Trả về object chứa trường data tương tự các hàm khác
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error retrieving Autocomplete data suggests the following task:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};