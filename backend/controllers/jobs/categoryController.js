const db = require('../../config/db');

exports.getAllCategories = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id, 
                c.name, 
                c.slug, 
                c.icon_url, 
                COUNT(j.id) AS job_count
            FROM Categories c
            LEFT JOIN Jobs j ON c.id = j.category_id
            GROUP BY c.id
            ORDER BY job_count DESC -- Sắp xếp từ nhiều job nhất xuống ít nhất
            LIMIT 5;                -- Chỉ lấy đúng 5 danh mục đứng đầu
        `;

        const [rows] = await db.execute(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Lỗi lấy top 5 danh mục:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};