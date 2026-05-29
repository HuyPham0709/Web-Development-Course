const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/social/notificationController");
const { verifyToken } = require("../../middlewares/authMiddleware");
const Notification = require("../../models/Notification"); // Import Model MongoDB

router.get("/", verifyToken, notificationController.getNotifications);
router.put("/:id/read", verifyToken, notificationController.markAsRead);

// API Đọc tất cả thông báo
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ ĐÃ SỬA: Chuyển sang cú pháp MongoDB Mongoose
    await Notification.updateMany({ user_id: userId }, { is_read: true });

    res.json({ success: true, message: "Đã đọc tất cả!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;