const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/admin/adminJobController');
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

// Lấy tất cả jobs (Job Management page)
router.get('/all', verifyToken, authorizeRole(['admin']), jobController.getAllJobs);

// [THÊM MỚI] Tuyến đường xuất dữ liệu CSV
router.get('/export', verifyToken, authorizeRole(['admin']), jobController.exportJobsCSV);

// Pending queue (Job Moderation page)
router.get('/admin/pending', verifyToken, authorizeRole(['admin']), jobController.getPendingJobs);
router.get('/admin/stats', verifyToken, authorizeRole(['admin']), jobController.getJobStats);

// Actions
router.put('/admin/:job_id/approve', verifyToken, authorizeRole(['admin']), jobController.approveJob);
router.put('/admin/:job_id/reject', verifyToken, authorizeRole(['admin']), jobController.rejectJob);
router.get('/:job_id', verifyToken, authorizeRole(['admin']), jobController.getJobById);
router.put('/:job_id', verifyToken, authorizeRole(['admin']), jobController.updateJob);

// [THÊM MỚI] Tuyến đường xóa hàng loạt và nhân bản tin
router.post('/bulk-delete', verifyToken, authorizeRole(['admin']), jobController.bulkDeleteJobs);
router.post('/:job_id/duplicate', verifyToken, authorizeRole(['admin']), jobController.duplicateJob);

// Xóa đơn lẻ
router.delete('/:job_id', verifyToken, authorizeRole(['admin']), jobController.deleteJob);

module.exports = router;