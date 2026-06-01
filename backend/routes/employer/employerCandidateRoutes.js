const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

/**
 * @route   GET /api/employer/candidate/:candidateId/profile
 */
router.get(
  '/candidate/:candidateId/profile',
  verifyToken,
  authorizeRole(['employer']),
  async (req, res) => {
    const { candidateId } = req.params;
    console.log(">>> ĐANG TRUY VẤN HỒ SƠ CHO ID:", candidateId);

    try {
      const [candidateRows] = await db.query(
        'SELECT id, username, email FROM Users WHERE id = ? AND role = ?',
        [candidateId, 'candidate']
      );

      if (candidateRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Ứng viên ID ${candidateId} không tồn tại hoặc không phải là Candidate.`
        });
      }
      const candidate = candidateRows[0];

      const [profileRows] = await db.query(
        'SELECT * FROM Profiles WHERE user_id = ?',
        [candidateId]
      );

      if (profileRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ứng viên này chưa hoàn thiện hồ sơ chi tiết.'
        });
      }
      const profile = profileRows[0];

      const [experiences] = await db.query(
        'SELECT company_name, position, start_date, end_date, description FROM Work_Experience WHERE profile_id = ? ORDER BY start_date DESC',
        [profile.id]
      );

      const [education] = await db.query(
        'SELECT school_name, major, gpa, start_date, end_date, description FROM Education WHERE profile_id = ? ORDER BY start_date DESC',
        [profile.id]
      );

      const [skills] = await db.query(
        `SELECT s.name FROM Skills s JOIN User_Skills us ON s.id = us.skill_id WHERE us.profile_id = ?`,
        [profile.id]
      );

      const data = {
        personalInfo: {
          username: candidate.username,
          display_name: profile.full_name || candidate.username,
          title: profile.title,
          bio: profile.bio,
          location: profile.location,
          avatar_url: profile.avatar_url,   // Lấy từ Profiles
          cv_url: profile.cv_url,
          email: candidate.email,
          phone: profile.phone,             // Lấy từ Profiles
          gender: profile.gender,
          dob: profile.dob,
        },
        experiences,
        education,
        skills: skills.map(s => s.name),
      };

      return res.json({ success: true, data });
    } catch (error) {
      console.error('Lỗi lấy hồ sơ:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
  }
);

/**
 * @route   POST /api/employer/candidate/:candidateId/view
 */
router.post(
  '/candidate/:candidateId/view',
  verifyToken,
  authorizeRole(['employer']),
  async (req, res) => {
    const employerId = req.user.id;
    const { candidateId } = req.params;

    try {
      await db.query(
        `INSERT INTO employer_profile_views 
         (employer_id, candidate_id, is_notified) 
         VALUES (?, ?, 0)
         ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP`,
        [employerId, candidateId]
      );

      return res.json({ success: true });
    } catch (error) {
      console.error('Lỗi ghi lượt xem:', error);
      return res.status(500).json({ success: false, message: 'Lỗi ghi dữ liệu.' });
    }
  }
);

/**
 * @route   GET /api/employer/candidate/:candidateId/views
 */
router.get(
  '/candidate/:candidateId/views',
  verifyToken,
  authorizeRole(['employer']),
  async (req, res) => {
    const { candidateId } = req.params;
    try {
      const [views] = await db.query(
        `SELECT 
            COALESCE(ep.full_name, u.username) AS employer_name,
            c.name AS company_name,
            c.logo_url AS company_logo,
            v.viewed_at
         FROM employer_profile_views v
         JOIN Users u ON v.employer_id = u.id
         LEFT JOIN Profiles ep ON ep.user_id = u.id
         LEFT JOIN Companies c ON u.company_id = c.id
         WHERE v.candidate_id = ?
         ORDER BY v.viewed_at DESC
         LIMIT 5`,
        [candidateId]
      );

      return res.json({ success: true, data: views });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử xem.' });
    }
  }
);

/**
 * @route   GET /api/employer/candidates/search
 */
router.get(
  '/candidates/search',
  verifyToken,
  authorizeRole(['employer']),
  async (req, res) => {
    const employerId = req.user.id;

    try {
      const query = `
        SELECT 
          u.id, 
          p.full_name AS name, 
          p.title, 
          p.location, 
          p.avatar_url
        FROM Users u
        JOIN Profiles p ON u.id = p.user_id
        WHERE u.role = 'candidate'
          AND u.id NOT IN (
            SELECT candidate_id 
            FROM Employer_Profile_Views 
            WHERE employer_id = ? AND status = 'ignored'
          )
          AND p.allow_employer_search = 1
      `;

      const [candidates] = await db.query(query, [employerId]);
      return res.json({ success: true, data: candidates });
    } catch (error) {
      console.error('Lỗi lấy danh sách ứng viên:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

/**
 * @route   POST /api/employer/candidate/:candidateId/reject
 */
router.post(
  '/candidate/:candidateId/reject',
  verifyToken,
  authorizeRole(['employer']),
  async (req, res) => {
    const employerId = req.user.id;
    const { candidateId } = req.params;

    try {
      await db.query(
        `INSERT INTO Employer_Profile_Views (employer_id, candidate_id, status) 
         VALUES (?, ?, 'ignored')
         ON DUPLICATE KEY UPDATE status = 'ignored'`,
        [employerId, candidateId]
      );

      return res.json({ success: true, message: 'Đã bỏ qua ứng viên thành công.' });
    } catch (error) {
      console.error('Lỗi khi bỏ qua ứng viên:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái.' });
    }
  }
);

module.exports = router;
