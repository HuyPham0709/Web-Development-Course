const db = require("../config/db");

// 1. Lấy danh sách thông báo
exports.getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.execute(
      "SELECT id, title, message, is_read, link_url, created_at FROM Notifications WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );

    // Map dữ liệu cẩn thận sang Object mà Frontend (Navbar.tsx) đang chờ
    const formattedNotifications = rows.map((item) => ({
      id: item.id,
      title: item.title,
      desc: item.description || "",
      unread: item.is_read === 0,
      linkUrl: item.link_url || null,
      time: item.created_at ? new Date(item.created_at).toLocaleString() : "", // Convert thời gian cho đẹp
    }));

    return res
      .status(200)
      .json({ success: true, data: formattedNotifications });
  } catch (error) {
    console.error("====== LỖI BACKEND CHỨC NĂNG THÔNG BÁO ======");
    console.error(error);
    console.error("=============================================");

    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Đánh dấu đã đọc (Giữ nguyên luồng cũ của bạn)
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute("UPDATE Notifications SET is_read = 1 WHERE id = ?", [id]);
    return res.status(200).json({ success: true, message: "Đã đọc!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
