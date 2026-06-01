const Notification = require("../../models/Notification");
const socketUtils = require("../../utils/socket");

exports.createAdminNotification = async ({ title, message, link_url = null }) => {
    try {
        const notification = await Notification.create({
            user_id: 0,
            title,
            message,
            link_url,
            is_read: false,
            created_at: new Date()
        });

        socketUtils.emitToUser("admin", "receive_admin_notification", {
            _id: notification._id.toString(),
            title,
            message,
            link_url,
            is_read: false,
            created_at: notification.created_at
        });

        return notification;
    } catch (error) {
        console.error("[ADMIN NOTIF ERROR]", error.message);
    }
};

exports.getAdminNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: 0 })
            .sort({ created_at: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ user_id: 0, is_read: false });

        return res.status(200).json({
            success: true,
            data: notifications.map(n => ({
                _id: n._id.toString(),
                title: n.title,
                message: n.message,
                link_url: n.link_url,
                is_read: n.is_read,
                created_at: n.created_at
            })),
            unreadCount
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.markAllAdminRead = async (req, res) => {
    try {
        await Notification.updateMany({ user_id: 0, is_read: false }, { is_read: true });
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.markOneAdminRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { is_read: true });
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ================= THÊM HÀM XÓA 1 THÔNG BÁO CỤ THỂ =================
exports.deleteAdminNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNotification = await Notification.findByIdAndDelete(id);

        if (!deletedNotification) {
            return res.status(404).json({ success: false, message: "Notification to be deleted not found." });
        }

        return res.status(200).json({ success: true, message: "Notification deleted successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ================= THÊM HÀM XÓA TẤT CẢ THÔNG BÁO CỦA ADMIN =================
exports.clearAllAdminNotifications = async (req, res) => {
    try {
        // Chỉ xóa các thông báo của hệ thống admin (có user_id: 0)
        await Notification.deleteMany({ user_id: 0 });
        return res.status(200).json({ success: true, message: "All system notifications have been cleared." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};