// backend/routes/auth/profileRoutes.js
const express = require('express');
const router = express.Router();

// 1. Gọi chính xác file Controller nằm trong thư mục auth
const ProfileController = require('../../controllers/auth/ProfileController'); 
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware'); 
const upload = require('../../middlewares/uploadMiddleware');

// 2. Tìm kiếm CV (Chỉ dành cho Nhà tuyển dụng)
router.get('/search-cv', verifyToken, authorizeRole(['employer']), ProfileController.searchCandidates);

// 3. Lấy profile của user đang đăng nhập
router.get('/me', verifyToken, ProfileController.getMyProfile);

// 4. Lấy profile theo userId cụ thể
router.get('/:userId', ProfileController.getProfile);

// 5. Lưu/Cập nhật toàn bộ profile (Sửa thành updateProfile cho đúng với Controller mới)
router.post('/update', verifyToken, ProfileController.updateProfile);

// 6. Upload Ảnh đại diện & Ảnh bìa
router.post('/upload-avatar', verifyToken, upload.single('avatar'), ProfileController.uploadAvatar);
router.post('/upload-cover', verifyToken, upload.single('cover'), ProfileController.uploadCover);

// 7. Quản lý bản CV (Upload & Xóa)
router.post('/cv/upload', verifyToken, upload.single('cv'), ProfileController.uploadCV);
router.delete('/cv', verifyToken, ProfileController.deleteCV);

module.exports = router;