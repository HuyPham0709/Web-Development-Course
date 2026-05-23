const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middlewares/authMiddleware"); // Middleware check JWT của bạn

router.get("/", verifyToken, notificationController.getNotifications);
router.put("/:id/read", verifyToken, notificationController.markAsRead);
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.execute("UPDATE Notifications SET is_read = 1 WHERE user_id = ?", [userId]);
    res.json({ success: true, message: "Đã đọc tất cả!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;