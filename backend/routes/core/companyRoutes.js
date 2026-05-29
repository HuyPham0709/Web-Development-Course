const express = require('express');
const router = express.Router();

// Import các hàm xử lý từ file Controller
const companyController = require('../../controllers/core/companyController');

// Import middleware xác thực tài khoản (nếu cần cho việc upload)
const { verifyToken } = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/uploadMiddleware'); // Giả định bạn dùng multer để lấy req.file

// ─────────────────────────────────────────────────────────────
// CẤU HÌNH TUYẾN ĐƯỜNG (ROUTES)
// ─────────────────────────────────────────────────────────────

// 1. Lấy danh sách Top công ty (Phải đặt TRÊN tuyến đường chứa tham số :id)
router.get('/top', companyController.getTopCompanies);

// 2. Lấy thông tin chi tiết một công ty theo ID hoặc Slug
router.get('/:id', companyController.getCompanyProfile);

// 3. Cập nhật thông tin công ty
router.put('/:id', verifyToken, companyController.updateCompanyProfile);

// 4. Upload Logo Công Ty
router.post('/upload-logo', verifyToken, upload.single('logo'), companyController.uploadLogo);

// 5. Upload Banner Công Ty
router.post('/upload-banner', verifyToken, upload.single('banner'), companyController.uploadBanner);

// Export router ra ngoài để file routes/index.js sử dụng
module.exports = router;