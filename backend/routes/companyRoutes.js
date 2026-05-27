// backend/routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Khai báo Middleware
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/top', companyController.getTopCompanies); 

// Lấy thông tin chi tiết một công ty (Đưa xuống dưới /top)
router.get('/:id', companyController.getCompanyProfile);

// Cập nhật thông tin công ty 
router.put('/:id', companyController.updateCompanyProfile);

// Các route upload giữ nguyên bên dưới...
router.post('/upload-logo', authMiddleware.verifyToken, upload.single('logo'), companyController.uploadLogo);
router.post('/upload-banner', authMiddleware.verifyToken, upload.single('banner'), companyController.uploadBanner);

module.exports = router;