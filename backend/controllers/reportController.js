const db = require('../config/db'); // Đường dẫn tới file config DB của bạn

// Gửi một report mới
exports.createReport = async (req, res) => {
    try {
        const { job_id, reason } = req.body;
        // reporter_id lấy từ token của user đang đăng nhập (thông qua authMiddleware)
        const reporter_id = req.user.id; 

        // Validate dữ liệu đầu vào
        if (!job_id || !reason) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp job_id và reason hợp lệ!' 
            });
        }

        // Insert vào bảng Reports theo đúng schema.sql
        const query = `
            INSERT INTO Reports (reporter_id, job_id, reason, status) 
            VALUES (?, ?, ?, 'pending')
        `;
        const [result] = await db.execute(query, [reporter_id, job_id, reason]);

        return res.status(201).json({
            success: true,
            message: 'Báo cáo vi phạm đã được gửi thành công!',
            data: {
                report_id: result.insertId
            }
        });
    } catch (error) {
        console.error('Error creating report:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi gửi báo cáo.' 
        });
    }
};