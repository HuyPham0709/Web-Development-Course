const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

/**
 * @route   GET /api/candidate/viewed-by-employers
 * @desc    Candidate xem danh sách các nhà tuyển dụng đã xem hồ sơ của mình
 * @access  Private (Role: candidate)
 */
router.get('/viewed-by-employers', verifyToken, authorizeRole(['candidate']), async (req, res) => {
    const candidateId = req.user.id;

    try {
        const [views] = await db.query(
            `SELECT 
                COALESCE(ep.full_name, u.username) AS employer_name,
                ep.avatar_url AS employer_avatar,
                c.id AS company_id,
                c.name AS company_name,
                c.logo_url AS company_logo,
                v.viewed_at
             FROM Employer_Profile_Views v
             JOIN Users u ON v.employer_id = u.id
             LEFT JOIN Profiles ep ON ep.user_id = u.id
             LEFT JOIN Companies c ON u.company_id = c.id
             WHERE v.candidate_id = ?
             ORDER BY v.viewed_at DESC`,
            [candidateId]
        );

        res.json({ success: true, data: views });
    } catch (error) {
        console.error('Lỗi lấy danh sách NTD đã xem:', error); 
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/candidate/profile/:id
 * @desc    Lấy chi tiết hồ sơ ứng viên
 * @access  Private 
 */
router.get('/profile/:id', verifyToken, async (req, res) => {
    const userId = req.params.id;

    try {
        const [userRows] = await db.query(
            `SELECT u.id as user_id, u.email,
                    p.id as profile_id, p.full_name, p.title, p.location, 
                    p.phone, p.gender, p.dob, p.bio, p.avatar_url
             FROM Users u
             LEFT JOIN Profiles p ON u.id = p.user_id
             WHERE u.id = ? AND u.role = 'candidate'`,
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy ứng viên' });
        }

        const candidateInfo = userRows[0];
        const profileId = candidateInfo.profile_id;

        if (!profileId) {
            return res.json({
                success: true,
                data: { personalInfo: candidateInfo, experiences: [], education: [], skills: [] }
            });
        }

        const [educationRows] = await db.query(
            `SELECT id, school_name, major, gpa, start_date, end_date, description, period_text 
             FROM Education WHERE profile_id = ? ORDER BY start_date DESC`,
            [profileId]
        );

        const [experienceRows] = await db.query(
            `SELECT id, company_name, position, start_date, end_date, description, period_text 
             FROM Work_Experience WHERE profile_id = ? ORDER BY start_date DESC`,
            [profileId]
        );

        const [skillRows] = await db.query(
            `SELECT s.id, s.name 
             FROM User_Skills us 
             JOIN Skills s ON us.skill_id = s.id 
             WHERE us.profile_id = ?`,
            [profileId]
        );

        res.json({
            success: true,
            data: {
                personalInfo: candidateInfo,
                education: educationRows,
                experiences: experienceRows,
                skills: skillRows.map(s => s.name)
            }
        });
    } catch (error) {
        console.error('Lỗi lấy profile ứng viên:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

/**
 * @route   POST /api/candidate/view/:id
 * @desc    Ghi nhận hành động Employer xem profile ứng viên
 * @access  Private (Role: employer)
 */
router.post('/view/:id', verifyToken, authorizeRole(['employer']), async (req, res) => {
    const candidateId = req.params.id;
    const employerId = req.user.id;

    try {
        await db.query(
            `INSERT IGNORE INTO Employer_Profile_Views (employer_id, candidate_id) 
             VALUES (?, ?)`,
            [employerId, candidateId]
        );

        res.json({ success: true, message: 'Đã ghi nhận lượt xem' });
    } catch (error) {
        console.error('Lỗi ghi nhận lượt xem:', error);
        res.status(500).json({ success: false, message: 'Lỗi server ghi nhận view' });
    }
});

/**
 * @route   GET /api/candidate/views/:id
 * @desc    Lấy danh sách các NTD đã xem profile của ứng viên
 * @access  Private
 */
router.get('/views/:id', verifyToken, async (req, res) => {
    const candidateId = req.params.id;

    try {
        const [views] = await db.query(
            `SELECT 
                COALESCE(ep.full_name, u.username) AS employer_name,
                c.name AS company_name,
                v.viewed_at
             FROM Employer_Profile_Views v
             JOIN Users u ON v.employer_id = u.id
             LEFT JOIN Profiles ep ON ep.user_id = u.id
             LEFT JOIN Companies c ON u.company_id = c.id
             WHERE v.candidate_id = ?
             ORDER BY v.viewed_at DESC`,
            [candidateId]
        );

        res.json({ success: true, data: views });
    } catch (error) {
        console.error('Lỗi lấy danh sách NTD:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
