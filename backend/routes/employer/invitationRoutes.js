const express = require('express');
const router = express.Router();
const invitationController = require('../../controllers/jobs/invitationController');
const authMiddleware = require("../../middlewares/authMiddleware");
// Import verifyToken và authorizeRole từ middleware của bạn
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

// 1. Áp dụng verifyToken cho TẤT CẢ các route trong file này. 
// Từ đây trở xuống, mọi route đều tự động bắt buộc phải đăng nhập (có token).
router.use(verifyToken);

// [EMPLOYER] Route lấy danh sách job để đổ vào Dropdown trong InviteModal
router.get('/jobs', authorizeRole(['employer']), invitationController.getEmployerJobs);

// [EMPLOYER] Route gửi lời mời ứng tuyển cho một ứng viên
router.post('/send', authorizeRole(['employer']), invitationController.sendInvitation);

// [CANDIDATE] Route lấy danh sách toàn bộ lời mời (Dùng cho trang quản lý lời mời của ứng viên)
router.get('/my-invitations', authorizeRole(['candidate']), invitationController.getCandidateInvitations);

// [CANDIDATE] Route ứng viên lấy chi tiết 1 lời mời (Dùng khi bấm vào thông báo để hiện Form Modal)
// Đã sửa: Bỏ authMiddleware thừa vì router.use(verifyToken) ở trên đã cover rồi
router.get('/:id', authorizeRole(['candidate']), invitationController.getInvitationDetail);

// [CANDIDATE] Route ứng viên phản hồi (Chấp nhận / Từ chối lời mời)
// Đã sửa: Bỏ authMiddleware thừa
router.put('/:id/status', authorizeRole(['candidate']), invitationController.updateInvitationStatus);

router.put("/status/:id", authMiddleware.verifyToken, invitationController.updateInvitationStatus);
module.exports = router;