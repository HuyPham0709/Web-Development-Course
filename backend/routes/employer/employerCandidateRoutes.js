const express = require('express');
const router = express.Router();
const db = require('../../config/db'); 
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

/**
 * @route   GET /api/employer/candidate/:candidateId/profile
 * @desc    Lấy chi tiết hồ sơ ứng viên (Dành cho Employer)
 */
router.get(
  '/candidate/:candidateId/profile',
  verifyToken,
  authorizeRole(['employer']),
  async (req, res) => {
    const { candidateId } = req.params;
    console.log(">>> ĐANG TRUY VẤN HỒ SƠ CHO ID:", candidateId);

    try {
      // 1. Kiểm tra User tồn tại với role 'candidate'
      const [candidateRows] = await db.query(
        'SELECT id, username, email FROM users WHERE id = ? AND role = ?',
        [candidateId, 'candidate']
      );

      if (candidateRows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: `Ứng viên ID ${candidateId} không tồn tại hoặc không phải là Candidate.` 
        });
      }
      const candidate = candidateRows[0];

      // 2. Lấy thông tin từ bảng Profiles
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

      // 3. Kiểm tra quyền riêng tư (allow_employer_search)
      if (profile.allow_employer_search === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'Ứng viên hiện đang để hồ sơ ở chế độ riêng tư.' 
        });
      }

      // 4. Lấy Kinh nghiệm, Học vấn, Kỹ năng
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

      // 5. Format dữ liệu trả về
      const data = {
        personalInfo: {
          username: candidate.username,
          display_name: profile.full_name || candidate.username,
          title: profile.title,
          bio: profile.bio,
          location: profile.location,
          avatar_url: profile.avatar_url, 
          cv_url: profile.cv_url,
          email: candidate.email,
          phone: profile.phone,
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
 * @route   POST /api/employer/candidate/:candidateId/reject
 * @desc    Từ chối ứng viên (Cập nhật trạng thái trong hệ thống)
 */
router.post(
  '/candidate/:candidateId/reject',
  verifyToken,
  authorizeRole(['employer']),
  async (req, res) => {
    const { candidateId } = req.params;
    
    try {
      // Cập nhật đơn ứng tuyển sang từ chối
      await db.query(
        `UPDATE Applications 
         SET status = 'rejected' 
         WHERE candidate_id = ? AND status IN ('pending', 'reviewed', 'interviewing')`,
        [candidateId]
      );

      // Cập nhật cả lời mời tuyển dụng nếu có
      await db.query(
        `UPDATE Job_Invitations 
         SET status = 'declined' 
         WHERE candidate_id = ? AND status = 'pending'`,
        [candidateId]
      );

      return res.json({ 
        success: true, 
        message: 'Đã cập nhật trạng thái từ chối ứng viên thành công.' 
      });
    } catch (error) {
      console.error('Lỗi khi từ chối ứng viên:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi từ chối ứng viên.' });
    }
  }
);

/**
 * @route   POST /api/employer/candidate/:candidateId/view
 * @desc    Ghi nhận lượt xem
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
 * @desc    Lấy danh sách nhà tuyển dụng đã xem
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
            u.username AS employer_name,
            c.name AS company_name,
            c.logo_url AS company_logo,
            v.viewed_at
         FROM employer_profile_views v
         JOIN users u ON v.employer_id = u.id
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

module.exports = router;