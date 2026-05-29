const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');
const jobController = require("../../controllers/jobs/jobController");

// ==========================================
// 1. CÁC ROUTE CỐ ĐỊNH (TĨNH) - PHẢI ĐỂ TRÊN CÙNG
// ==========================================

// Route xem toàn bộ job (Công khai)

router.get('/', jobController.getAllJobs);
router.get('/autocomplete', jobController.getSuggestions);
router.get('/all', jobController.getAllJobs);

// API Lấy job của riêng nhà tuyển dụng đó (Phải để TRÊN /:id)
router.get('/my-jobs', verifyToken, authorizeRole(['employer']), jobController.getJobsByEmployer);

// API Đăng tin
router.post('/create', verifyToken, authorizeRole(['employer']), jobController.createJob);

// API Quản lý Admin
router.delete('/delete-user/:id', verifyToken, authorizeRole(['admin']), (req, res) => {
    res.send('Admin đã xóa người dùng');
});


// ==========================================
// 2. CÁC ROUTE DÙNG THAM SỐ DỘNG (/:id) - PHẢI ĐỂ DƯỚI CÙNG
// ==========================================

// Chi tiết Job (Công khai)
router.get('/:id', jobController.getJobDetail);

// Cập nhật Job
router.put('/:id', verifyToken, authorizeRole(['employer']), jobController.updateJob);

// Xóa Job
router.delete('/:id', verifyToken, authorizeRole(['employer', 'admin']), jobController.deleteJob);

module.exports = router;