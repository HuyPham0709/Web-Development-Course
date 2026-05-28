// backend/routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../../controllers/core/companyController');

// Khai báo Middleware
const authMiddleware = require('../../middlewares/authMiddleware'); // Xác thực người dùng đăng nhập
const upload = require('../../middlewares/uploadMiddleware');       // Xử lý file (ảnh)

// Lấy thông tin công ty (Ai cũng có thể xem)
router.get('/:id', companyController.getCompanyProfile);

// Cập nhật thông tin công ty (Chỉ Employer, chưa cần auth vì đang test ở local theo Frontend)
// (Bạn nên thêm authMiddleware vào đây ở môi trường thực tế)
router.put('/:id', companyController.updateCompanyProfile);

// Thêm .verifyToken vào sau authMiddleware
router.post('/upload-logo', authMiddleware.verifyToken, upload.single('logo'), companyController.uploadLogo);

// Thêm .verifyToken vào sau authMiddleware
router.post('/upload-banner', authMiddleware.verifyToken, upload.single('banner'), companyController.uploadBanner);

module.exports = router;