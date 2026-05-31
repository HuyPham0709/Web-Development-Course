const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/admin/Reportcontroller'); // Gọi đúng Controller
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

// 🎯 ĐƯỜNG DẪN MỚI: Ứng viên gửi báo cáo vi phạm
router.post('/', verifyToken, ctrl.createReport);

// 🔒 CÁC ĐƯỜNG DẪN CŨ: Dành riêng cho Admin quản lý
router.get('/', verifyToken, authorizeRole(['admin']), ctrl.getReports);
router.put('/:id/status', verifyToken, authorizeRole(['admin']), ctrl.updateReportStatus);
router.delete('/:id/job', verifyToken, authorizeRole(['admin']), ctrl.deleteReportedJob);

module.exports = router;