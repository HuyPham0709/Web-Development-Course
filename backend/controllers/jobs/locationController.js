const db = require('../../config/db');

exports.getAllLocations = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Locations');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};