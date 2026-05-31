const express = require('express');
const router = express.Router();
const invitationController = require('../../controllers/jobs/invitationController');
// Import cả verifyToken
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

// Áp dụng verifyToken cho TẤT CẢ các route trong file này
router.use(verifyToken);

// Route lấy danh sách job (Cho Employer)
router.get('/jobs', authorizeRole(['employer']), invitationController.getEmployerJobs);

// Route lấy danh sách lời mời (Cho Candidate - Trang bạn đang làm)
router.get('/my-invitations', authorizeRole(['candidate']), invitationController.getCandidateInvitations);

// Route gửi lời mời (Cho Employer)
router.post('/send', authorizeRole(['employer']), invitationController.sendInvitation);

module.exports = router;