const db = require('../../config/db');

// ==================== CATEGORIES ====================

exports.getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT c.id, c.name, c.slug, c.icon_url, c.created_at,
                COUNT(j.id) AS job_count
            FROM categories c
            LEFT JOIN jobs j ON j.category_id = c.id AND j.deleted_at IS NULL
            GROUP BY c.id
            ORDER BY c.name ASC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCategory = async (req, res) => {
    const { name, slug, icon_url } = req.body;
    if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống' });
    }
    try {
        const autoSlug = slug || name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        const [result] = await db.execute(
            'INSERT INTO Categories (name, slug, icon_url) VALUES (?, ?, ?)',
            [name.trim(), autoSlug, icon_url || null]
        );
        const [newRow] = await db.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newRow[0] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Tên hoặc slug đã tồn tại' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, slug, icon_url } = req.body;
    if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống' });
    }
    try {
        const [result] = await db.execute(
            'UPDATE Categories SET name = ?, slug = ?, icon_url = ? WHERE id = ?',
            [name.trim(), slug || null, icon_url || null, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        const [updated] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
        res.status(200).json({ success: true, data: updated[0] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Tên hoặc slug đã tồn tại' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Kiểm tra có jobs đang dùng không
        const [jobs] = await db.execute(
            'SELECT COUNT(*) AS count FROM jobs WHERE category_id = ? AND deleted_at IS NULL',
            [id]
        );
        if (jobs[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa: có ${jobs[0].count} tin tuyển dụng đang dùng danh mục này`
            });
        }
        const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.status(200).json({ success: true, message: 'Đã xóa danh mục' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== locations ====================

exports.getAlllocations = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT l.id, l.name, l.slug, l.created_at,
                COUNT(j.id) AS job_count
            FROM locations l
            LEFT JOIN jobs j ON j.location_id = l.id AND j.deleted_at IS NULL
            GROUP BY l.id
            ORDER BY l.name ASC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createLocation = async (req, res) => {
    const { name, slug } = req.body;
    if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Tên địa điểm không được để trống' });
    }
    try {
        const autoSlug = slug || name.toLowerCase()
            .replace(/\s+/g, '-')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9-]/g, '');

        const [result] = await db.execute(
            'INSERT INTO locations (name, slug) VALUES (?, ?)',
            [name.trim(), autoSlug]
        );
        const [newRow] = await db.execute('SELECT * FROM locations WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newRow[0] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Tên hoặc slug đã tồn tại' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLocation = async (req, res) => {
    const { id } = req.params;
    const { name, slug } = req.body;
    if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Tên địa điểm không được để trống' });
    }
    try {
        const [result] = await db.execute(
            'UPDATE locations SET name = ?, slug = ? WHERE id = ?',
            [name.trim(), slug || null, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy địa điểm' });
        }
        const [updated] = await db.execute('SELECT * FROM locations WHERE id = ?', [id]);
        res.status(200).json({ success: true, data: updated[0] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Tên hoặc slug đã tồn tại' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteLocation = async (req, res) => {
    const { id } = req.params;
    try {
        const [jobs] = await db.execute(
            'SELECT COUNT(*) AS count FROM jobs WHERE location_id = ? AND deleted_at IS NULL',
            [id]
        );
        if (jobs[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa: có ${jobs[0].count} tin tuyển dụng đang dùng địa điểm này`
            });
        }
        const [result] = await db.execute('DELETE FROM locations WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy địa điểm' });
        }
        res.status(200).json({ success: true, message: 'Đã xóa địa điểm' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== SKILLS ====================

exports.getAllSkills = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT s.id, s.name,
                COUNT(js.job_id) AS job_count,
                COUNT(us.profile_id) AS user_count
            FROM Skills s
            LEFT JOIN Job_Skills js ON js.skill_id = s.id
            LEFT JOIN User_Skills us ON us.skill_id = s.id
            GROUP BY s.id
            ORDER BY s.name ASC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSkill = async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Tên kỹ năng không được để trống' });
    }
    try {
        const [result] = await db.execute(
            'INSERT INTO Skills (name) VALUES (?)',
            [name.trim()]
        );
        const [newRow] = await db.execute('SELECT * FROM Skills WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newRow[0] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Kỹ năng đã tồn tại' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSkill = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Tên kỹ năng không được để trống' });
    }
    try {
        const [result] = await db.execute(
            'UPDATE Skills SET name = ? WHERE id = ?',
            [name.trim(), id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy kỹ năng' });
        }
        const [updated] = await db.execute('SELECT * FROM Skills WHERE id = ?', [id]);
        res.status(200).json({ success: true, data: updated[0] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Tên kỹ năng đã tồn tại' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSkill = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM Skills WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy kỹ năng' });
        }
        res.status(200).json({ success: true, message: 'Đã xóa kỹ năng' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};