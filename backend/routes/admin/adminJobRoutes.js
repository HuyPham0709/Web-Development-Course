const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/admin/adminJobController');
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

// === CƠ CHẾ ĐÁNH CHẶN AN TOÀN TRÁNH SẬP SERVER ===
function safeGet(path, ...handlers) {
    // Lấy handler cuối cùng (chính là hàm controller)
    const controllerHandler = handlers[handlers.length - 1];
    
    if (typeof controllerHandler === 'function') {
        router.get(path, ...handlers);
    } else {
        console.error(`\n🚨 [LỖI ĐỊNH TUYẾN]: Tuyến đường GET "${path}" đang bị hoảng!`);
        console.error(`👉 Nguyên nhân: Hàm xử lý trong Controller đang bị undefined.`);
        console.error(`📌 Vui lòng kiểm tra lại file adminJobController.js hoặc kiểm tra lỗi chính tả tên hàm.\n`);
        
        // Tạo một handler giả lập để không làm sập app khi khởi động
        router.get(path, (req, res) => {
            res.status(500).json({ 
                success: false, 
                message: `Tuyến đường ${path} tạm thời không khả dụng do lỗi hệ thống.` 
            });
        });
    }
}

function safePut(path, ...handlers) {
    const controllerHandler = handlers[handlers.length - 1];
    if (typeof controllerHandler === 'function') {
        router.put(path, ...handlers);
    } else {
        console.error(`\n🚨 [LỖI ĐỊNH TUYẾN]: Tuyến đường PUT "${path}" bị hỏng do Controller undefined.\n`);
        router.put(path, (req, res) => res.status(500).json({ success: false }));
    }
}

function safePost(path, ...handlers) {
    const controllerHandler = handlers[handlers.length - 1];
    if (typeof controllerHandler === 'function') {
        router.post(path, ...handlers);
    } else {
        console.error(`\n🚨 [LỖI ĐỊNH TUYẾN]: Tuyến đường POST "${path}" bị hỏng do Controller undefined.\n`);
        router.post(path, (req, res) => res.status(500).json({ success: false }));
    }
}

function safeDelete(path, ...handlers) {
    const controllerHandler = handlers[handlers.length - 1];
    if (typeof controllerHandler === 'function') {
        router.delete(path, ...handlers);
    } else {
        console.error(`\n🚨 [LỖI ĐỊNH TUYẾN]: Tuyến đường DELETE "${path}" bị hỏng do Controller undefined.\n`);
        router.delete(path, (req, res) => res.status(500).json({ success: false }));
    }
}
// ===================================================


// 1. Các tuyến đường GET
safeGet('/all', verifyToken, authorizeRole(['admin']), jobController.getAlljobs);
safeGet('/export', verifyToken, authorizeRole(['admin']), jobController.exportjobsCSV);
safeGet('/pending', verifyToken, authorizeRole(['admin']), jobController.getPendingjobs);
safeGet('/stats', verifyToken, authorizeRole(['admin']), jobController.getjobstats);
safeGet('/:job_id', verifyToken, authorizeRole(['admin']), jobController.getJobById);

// 2. Các tuyến đường PUT
safePut('/:job_id/approve', verifyToken, authorizeRole(['admin']), jobController.approveJob);
safePut('/:job_id/reject', verifyToken, authorizeRole(['admin']), jobController.rejectJob);
safePut('/:job_id', verifyToken, authorizeRole(['admin']), jobController.updateJob);

// 3. Các tuyến đường POST
safePost('/bulk-delete', verifyToken, authorizeRole(['admin']), jobController.bulkDeletejobs);
safePost('/:job_id/duplicate', verifyToken, authorizeRole(['admin']), jobController.duplicateJob);

// 4. Các tuyến đường DELETE
safeDelete('/:job_id', verifyToken, authorizeRole(['admin']), jobController.deleteJob);

module.exports = router;