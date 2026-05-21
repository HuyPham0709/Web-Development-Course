const db = require('../config/db');

exports.getTopCompanies = async (req, res) => {
    try {
        const { is_verified } = req.query;
        let query = "SELECT * FROM Companies";
        let params = [];

        // Nếu frontend truyền ?is_verified=true
        if (is_verified === 'true') {
            query += " WHERE is_verified = 1";
        }

        const [rows] = await db.execute(query, params);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Lỗi getTopCompanies:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};