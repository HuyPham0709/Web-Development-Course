const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const adminNotifController = require("../../controllers/admin/adminNotificationController");

// Lấy & cập nhật trạng thái đọc thông báo
router.get("/notifications", adminNotifController.getAdminNotifications);
router.put("/notifications/read-all", adminNotifController.markAllAdminRead);
router.put("/notifications/:id/read", adminNotifController.markOneAdminRead);

// --- ĐĂNG KÝ THÊM 2 ROUTE XÓA THÔNG BÁO Ở ĐÂY ---
router.delete("/notifications/clear-all", adminNotifController.clearAllAdminNotifications);
router.delete("/notifications/:id", adminNotifController.deleteAdminNotification);

// Thống kê Dashboard
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;