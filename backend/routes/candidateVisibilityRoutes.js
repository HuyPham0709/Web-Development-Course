// backend/routes/candidateVisibilityRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Đường dẫn tới file kết nối database của bạn
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

// GET: Lấy trạng thái hiển thị của ứng viên
router.get('/visibility', verifyToken, authorizeRole(['candidate']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT allow_employer_search FROM Profiles WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({ 
      success: true,
      allow_employer_search: rows[0]?.allow_employer_search === 1 
    });
  } catch (error) {
    console.error('Error getting visibility:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT: Cập nhật trạng thái hiển thị
router.put('/visibility', verifyToken, authorizeRole(['candidate']), async (req, res) => {
  try {
    const { allow_employer_search } = req.body;

    if (typeof allow_employer_search !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Invalid value' });
    }

    await pool.query(
      `UPDATE Profiles SET allow_employer_search = ? WHERE user_id = ?`,
      [allow_employer_search, req.user.id]
    );

    res.json({ success: true, allow_employer_search });
  } catch (error) {
    console.error('Error updating visibility:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET: Lấy danh sách nhà tuyển dụng đã xem profile
router.get('/profile-views', verifyToken, authorizeRole(['candidate']), async (req, res) => {
  try {
    const [views] = await pool.query(
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

    // Đánh dấu đã thông báo
    await pool.query(
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