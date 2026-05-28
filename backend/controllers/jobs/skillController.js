const db = require('../../config/db');

exports.getAllSkills = async (req, res) => {
    try {
        const query = "SELECT name FROM Skills";
        const [rows] = await db.execute(query);
        
        // Chuyển đổi mảng đối tượng [{name: 'React'}, {name: 'Node'}] thành mảng chuỗi ['React', 'Node']
        const skillNames = rows.map(row => row.name);

        res.status(200).json({ success: true, data: skillNames });
    } catch (error) {
        console.error("Lỗi getAllSkills:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};