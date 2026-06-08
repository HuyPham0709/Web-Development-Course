const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/admin/adminJobController');
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

// 1. Sửa chữ 'j' thường thành 'J' hoa (kiểm tra lại trong file Controller của bạn xem đúng chữ J hoa không nhé)
router.get('/all', verifyToken, authorizeRole(['admin']), jobController.getAllJobs);

// Tuyến đường xuất dữ liệu CSV
router.get('/export', verifyToken, authorizeRole(['admin']), jobController.exportjobsCSV);

// 2. BỎ CHỮ '/admin' BỊ THỪA Ở ĐÂY ĐI
router.get('/pending', verifyToken, authorizeRole(['admin']), jobController.getPendingjobs);
router.get('/stats', verifyToken, authorizeRole(['admin']), jobController.getjobstats);

// Actions (BỎ CHỮ '/admin' BỊ THỪA Ở ĐÂY LUÔN)
router.put('/:job_id/approve', verifyToken, authorizeRole(['admin']), jobController.approveJob);
router.put('/:job_id/reject', verifyToken, authorizeRole(['admin']), jobController.rejectJob);

router.get('/:job_id', verifyToken, authorizeRole(['admin']), jobController.getJobById);
router.put('/:job_id', verifyToken, authorizeRole(['admin']), jobController.updateJob);

// Tuyến đường xóa hàng loạt và nhân bản tin
router.post('/bulk-delete', verifyToken, authorizeRole(['admin']), jobController.bulkDeletejobs);
router.post('/:job_id/duplicate', verifyToken, authorizeRole(['admin']), jobController.duplicateJob);

// Xóa đơn lẻ
router.delete('/:job_id', verifyToken, authorizeRole(['admin']), jobController.deleteJob);

module.exports = router;