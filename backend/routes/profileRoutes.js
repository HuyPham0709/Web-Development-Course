// backend/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileController');
const { verifyToken } = require('../middlewares/authMiddleware'); // dùng đúng tên export
const upload = require('../middlewares/uploadMiddleware');        // multer đã cấu hình

router.get('/search-cv', profileController.searchCandidates); // Đẩy lên trên đầu
router.get('/:userId', profileController.getProfile);

// Lưu toàn bộ profile (personalInfo + experiences + education + skills)
router.post('/update', verifyToken, profileController.updateProfile);
// Thêm 2 dòng này vào trước module.exports
router.post('/upload-avatar', verifyToken, upload.single('avatar'), profileController.uploadAvatar);
router.post('/upload-cover', verifyToken, upload.single('cover'), profileController.uploadCover);
// Upload CV — multer xử lý file trước, controller lưu URL vào DB
router.post(
  "/cv/upload",
  verifyToken,
  upload.single("cv"),
  profileController.uploadCV
);

// Xóa CV
router.delete('/cv', verifyToken, profileController.deleteCV);

module.exports = router;