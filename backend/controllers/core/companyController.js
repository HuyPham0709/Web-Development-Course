const db = require('../config/db');
const { uploadToCloudinary } = require('../config/cloudinary');

// ─── 1. GET /api/companies/:id HOẶC /api/companies/:slug ─────────────────────
// Lấy thông tin chi tiết của một công ty dựa trên ID hoặc Slug
exports.getCompanyProfile = async (req, res) => {
    const { id } = req.params;

    try {
        let query = `
            SELECT 
                id, 
                name, 
                logo_url, 
                banner_url, 
                website, 
                description, 
                address, 
                slug, 
                is_verified 
            FROM Companies 
            WHERE 
        `;
        const queryParams = [];

        // Kiểm tra xem tham số truyền vào là ID (số) hay Slug (chuỗi chữ)
        if (!isNaN(id) && Number.isInteger(Number(id))) {
            query += `id = ? AND deleted_at IS NULL`;
            queryParams.push(parseInt(id, 10));
        } else {
            query += `slug = ? AND deleted_at IS NULL`;
            queryParams.push(id);
        }

        const [rows] = await db.query(query, queryParams);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin công ty yêu cầu.'
            });
        }

        // Trả về trực tiếp bản ghi công ty khớp kết quả theo đúng chuẩn dữ liệu
        return res.json(rows[0]);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu công ty:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi lấy thông tin công ty.',
            error: error.message
        });
    }
};

// ─── 2. PUT /api/companies/:id ───────────────────────────────────────────────
// Cập nhật thông tin cấu hình của một công ty
exports.updateCompanyProfile = async (req, res) => {
    const { id } = req.params;
    const { name, website, description, address } = req.body;

    try {
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Tên công ty không được để trống!'
            });
        }

        const updateQuery = `
            UPDATE Companies 
            SET name = ?, website = ?, description = ?, address = ?
            WHERE id = ? AND deleted_at IS NULL
        `;

        const [result] = await db.query(updateQuery, [
            name,
            website || null,
            description || null,
            address || null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy công ty để cập nhật.'
            });
        }

        // Truy vấn lại để lấy thông tin mới nhất trả về cho Frontend hiển thị tức thời
        const [updatedRows] = await db.query(
            `SELECT id, name, logo_url, banner_url, website, description, address, slug, is_verified 
             FROM Companies WHERE id = ?`,
            [id]
        );

        return res.json(updatedRows[0]);

    } catch (error) {
        console.error('Lỗi khi cập nhật công ty:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi cập nhật thông tin công ty.',
            error: error.message
        });
    }
};

// ─── 3. POST /api/companies/upload-logo ──────────────────────────────────────
// Upload Logo Công Ty
exports.uploadLogo = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy ID tài khoản từ Token bảo mật

        // Lấy company_id thực tế từ Database dựa trên userId
        const [users] = await db.query(`SELECT company_id FROM Users WHERE id = ?`, [userId]);

        if (users.length === 0 || !users[0].company_id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Tài khoản của bạn chưa được liên kết với bất kỳ công ty nào!' 
            });
        }

        const companyId = users[0].company_id;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh logo!' });
        }

        // Đẩy file ảnh lên Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, 'company_logos');
        const logoUrl = result.secure_url;

        // Lưu đường dẫn ảnh mới vào bảng Companies
        await db.query(`UPDATE Companies SET logo_url = ? WHERE id = ? AND deleted_at IS NULL`, [logoUrl, companyId]);

        return res.json({
            success: true,
            message: 'Cập nhật logo công ty thành công!',
            logo_url: logoUrl
        });

    } catch (error) {
        console.error('Lỗi khi upload logo:', error);
        return res.status(500).json({ success: false, message: 'Lỗi upload logo.', error: error.message });
    }
};

// ─── 4. POST /api/companies/upload-banner ────────────────────────────────────
// Upload Banner Công Ty
exports.uploadBanner = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy ID tài khoản từ Token bảo mật

        // Lấy company_id thực tế từ Database dựa trên userId
        const [users] = await db.query(`SELECT company_id FROM Users WHERE id = ?`, [userId]);

        if (users.length === 0 || !users[0].company_id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Tài khoản của bạn chưa được liên kết với bất kỳ công ty nào!' 
            });
        }

        const companyId = users[0].company_id;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh bìa!' });
        }

        // Đẩy file ảnh lên Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, 'company_banners');
        const bannerUrl = result.secure_url;

        // Lưu đường dẫn ảnh mới vào bảng Companies
        await db.query(`UPDATE Companies SET banner_url = ? WHERE id = ? AND deleted_at IS NULL`, [bannerUrl, companyId]);

        return res.json({
            success: true,
            message: 'Cập nhật ảnh bìa công ty thành công!',
            banner_url: bannerUrl
        });

    } catch (error) {
        console.error('Lỗi khi upload banner:', error);
        return res.status(500).json({ success: false, message: 'Lỗi upload banner.', error: error.message });
    }
};

// ─── 5. GET /api/companies/top ────────────────────────────────────────────────
// Lấy danh sách Top 3 công ty nổi bật kèm Tech Stack động
exports.getTopCompanies = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.logo_url,
                c.banner_url,
                c.description,
                c.is_verified,
                -- Gom nhóm toàn bộ tên kỹ năng từ các Jobs đang kích hoạt thành chuỗi phân tách bằng dấu phẩy
                GROUP_CONCAT(DISTINCT s.name SEPARATOR ',') AS tech_stack
            FROM Companies c
            LEFT JOIN Jobs j ON c.id = j.company_id AND j.status = 'approved' AND j.deleted_at IS NULL
            LEFT JOIN Job_Skills js ON j.id = js.job_id
            LEFT JOIN Skills s ON js.skill_id = s.id
            WHERE c.deleted_at IS NULL
            GROUP BY c.id
            ORDER BY c.is_verified DESC, c.created_at DESC
            LIMIT 3;
        `;

        const [rows] = await db.query(query);

        // Trả về danh sách dữ liệu có chứa cột tech_stack động cho Frontend
        return res.json(rows);

    } catch (error) {
        console.error('Lỗi khi nạp danh sách Top công ty kèm Tech Stack:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi kết xuất dữ liệu công ty nổi bật.',
            error: error.message
        });
    }
};