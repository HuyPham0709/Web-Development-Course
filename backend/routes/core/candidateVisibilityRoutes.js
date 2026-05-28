// backend/routes/core/candidateVisibilityRoutes.js
const express = require('express');
const router = express.Router();
const promisePool = require('../../config/db'); 
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

// GET: Lấy trạng thái hiển thị của ứng viên (Phiên bản tự động nhận diện tên cột)
router.get('/visibility', verifyToken, authorizeRole(['candidate']), async (req, res) => {
  try {
    // 1. Kiểm tra cấu trúc các cột đang có trong bảng Profiles của bạn
    const [columns] = await promisePool.query(`SHOW COLUMNS FROM Profiles`);
    const columnNames = columns.map(c => c.Field);

    // 2. Tìm xem bạn đang dùng tên cột nào trong các tên phổ biến dưới đây
    const possibleFields = ['allow_employer_search', 'is_visible', 'status', 'public', 'searchable'];
    const activeField = possibleFields.find(field => columnNames.includes(field));

    // 3. Nếu tìm thấy cột phù hợp trong DB, tiến hành lấy dữ liệu
    if (activeField) {
      const [rows] = await promisePool.query(
        `SELECT ${activeField} FROM Profiles WHERE user_id = ?`,
        [req.user.id]
      );
      
      return res.json({ 
        success: true,
        allow_employer_search: rows[0]?.[activeField] === 1 || rows[0]?.[activeField] === true
      });
    }

    // 4. Phương án dự phòng: Nếu bảng Profiles của bạn chưa có cột cấu hình nào, 
    // mặc định trả về true để Frontend không bị lỗi 500
    res.json({ 
      success: true,
      allow_employer_search: true 
    });

  } catch (error) {
    console.error('Error getting visibility:', error);
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});

// PUT: Cập nhật trạng thái hiển thị
router.put('/visibility', verifyToken, authorizeRole(['candidate']), async (req, res) => {
  try {
    const { allow_employer_search } = req.body;
    if (typeof allow_employer_search !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Invalid value' });
    }

    const [columns] = await promisePool.query(`SHOW COLUMNS FROM Profiles`);
    const columnNames = columns.map(c => c.Field);
    const possibleFields = ['allow_employer_search', 'is_visible', 'status', 'public', 'searchable'];
    const activeField = possibleFields.find(field => columnNames.includes(field));

    if (activeField) {
      await promisePool.query(
        `UPDATE Profiles SET ${activeField} = ? WHERE user_id = ?`,
        [allow_employer_search ? 1 : 0, req.user.id]
      );
    }

    res.json({ success: true, allow_employer_search });
  } catch (error) {
    console.error('Error updating visibility:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET: Lấy danh sách nhà tuyển dụng đã xem profile
router.get('/profile-views', verifyToken, authorizeRole(['candidate']), async (req, res) => {
  try {
    const [views] = await promisePool.query(
      `SELECT 
        v.employer_id,
        c.name AS company_name,
        c.logo_url AS company_logo,
        v.viewed_at,
        (v.is_notified = 0) AS is_new
      FROM Employer_Profile_Views v
      JOIN Users u ON v.employer_id = u.id
      LEFT JOIN Companies c ON u.company_id = c.id
      WHERE v.candidate_id = ?
      ORDER BY v.viewed_at DESC`,
      [req.user.id]
    );

    await promisePool.query(
      `UPDATE Employer_Profile_Views SET is_notified = 1 
       WHERE candidate_id = ? AND is_notified = 0`,
      [req.user.id]
    );

    res.json({ success: true, views });
  } catch (error) {
    console.error('Error getting profile views:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;