const { Server } = require("socket.io");

let io;
// Bản đồ lưu số lượng kết nối để biết user còn online hay không: { userId: Set(socketId1, socketId2) }
const onlineUsers = new Map();

// Bản đồ lưu trữ trạng thái xem phòng chat của User: { userId: conversationId }
const userActiveRooms = new Map();

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: [
          process.env.CLIENT_URL || "http://localhost:5173",
          "http://localhost:5174"
        ],
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("🔌 Thiết bị kết nối:", socket.id);

      // Khi user đăng nhập/vào trang
      socket.on("add_user", (userId) => {
        if (userId) {
          const stringUserId = String(userId);

          // ✅ GIẢI PHÁP VÀNG: Ép socket này tham gia vào phòng riêng của User
          socket.join(`user_${stringUserId}`);
          if (stringUserId === "admin") {
            socket.join("user_admin");
            console.log(`🛡️ Admin đã gia nhập ROOM [user_admin]`);
          }

          // Quản lý danh sách online hỗ trợ đa kết nối (Nhiều tab / Nhiều component)
          if (!onlineUsers.has(stringUserId)) {
            onlineUsers.set(stringUserId, new Set());
          }
          onlineUsers.get(stringUserId).add(socket.id);

          io.emit("get_online_users", Array.from(onlineUsers.keys()));
          console.log(
            `👤 User ${userId} đã gia nhập ROOM [user_${stringUserId}] (Socket: ${socket.id})`,
          );
        }
      });

      // Khi user click vào một phòng chat cụ thể ở Frontend
      socket.on("mark_messages_as_read", async ({ conversationId, userId }) => {
        try {
          const Conversation = require("../models/Conversation");
          // Reset unreadCount về 0
          await Conversation.updateOne(
            { _id: conversationId },
            { $set: { unreadCount: 0 } },
          );

          // Bắn tín hiệu ngược lại cho client để update badge trên Navbar (ĐÃ FIX THÊM TIỀN TỐ)
          const stringUserId = String(userId);
          io.to(`user_${stringUserId}`).emit("update_unread_total");

        } catch (error) {
          console.error("Lỗi khi mark as read via socket:", error);
        }
      });

      // Gửi tin nhắn real-time bằng Phòng định danh
      socket.on("send_message", (data) => {
        console.log(
          "\n📩 [SOCKET] Nhận sự kiện 'send_message' từ Client:",
          data,
        );

        const receiverId =
          data.receiverId ||
          data.candidateId ||
          data.receiver_id ||
          data.toUserId;
        const { senderId, text, fileUrl, conversationId, createdAt } = data;

        if (!receiverId) {
          console.error(
            "❌ [SOCKET ERROR] Không tìm thấy ID người nhận trong payload!",
          );
          return;
        }

        const stringReceiverId = String(receiverId);
        const isReceiverInRoom =
          userActiveRooms.get(stringReceiverId) === String(conversationId);

        // ✅ KIỂM TRA ONLINE QUA MAP SET
        if (onlineUsers.has(stringReceiverId)) {
          const targetRoom = `user_${stringReceiverId}`;

          // 1. Đẩy tin nhắn vào màn hình chat đối phương (Gửi vào room của họ)
          io.to(targetRoom).emit("receive_message", {
            conversationId,
            senderId,
            receiverId: stringReceiverId,
            text,
            fileUrl,
            isRead: isReceiverInRoom,
            createdAt: createdAt || new Date(),
          });

          // 2. Báo hiệu tăng số đếm tin nhắn trên Navbar (Chỉ bắn nếu họ đang ở phòng khác/trang khác)
          if (!isReceiverInRoom) {
            io.to(targetRoom).emit("update_unread_total", {
              userId: stringReceiverId,
            });
          }

          console.log(
            `🚀 Đã phát tin nhắn tới ROOM: ${targetRoom}. Trạng thái đọc: ${isReceiverInRoom}`,
          );
        }

        // 3. Đóng gói thông báo quả chuông hệ thống
        const chatNotificationPayload = {
          _id: `chat_msg_${Date.now()}`,
          title: "Tin nhắn mới",
          message: text || (fileUrl ? "📷 Đã gửi một tệp đính kèm..." : ""),
          created_at: new Date().toISOString(),
          is_read: false,
          link_url: "/chat",
        };

        module.exports.sendNotification(receiverId, chatNotificationPayload);
      });

      socket.on("disconnect", () => {
        let disconnectedUserId = null;

        // Loại bỏ socketId khỏi danh sách quản lý đa kết nối
        for (let [userId, socketIds] of onlineUsers.entries()) {
          if (socketIds.has(socket.id)) {
            socketIds.delete(socket.id);
            if (socketIds.size === 0) {
              onlineUsers.delete(userId);
              disconnectedUserId = userId;
            }
            break;
          }
        }

        if (disconnectedUserId) {
          userActiveRooms.delete(String(disconnectedUserId));
        }

        io.emit("get_online_users", Array.from(onlineUsers.keys()));
        console.log("❌ Một thiết bị đã ngắt kết nối:", socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error("Socket.io is not initialized!");
    return io;
  },

  // ✅ SỬA HÀM BẮN CHUÔNG: Gửi thẳng vào Room của User
  sendNotification: (targetUserId, notificationData) => {
    if (!io) return;
    const stringTargetId = String(targetUserId);

    if (onlineUsers.has(stringTargetId)) {
      io.to(`user_${stringTargetId}`).emit(
        "receive_notification",
        notificationData,
      );
      console.log(
        `⚡ [NOTIFICATION] Đã bắn thông qua ROOM [user_${stringTargetId}]`,
      );
    } else {
      console.log(`📴 User ${targetUserId} đang offline, thông báo đợi F5.`);
    }
  },

  // ✅ SỬA HÀM CẦU NỐI HTTP: Gửi thẳng vào Room của User
  emitToUser: (targetUserId, eventName, eventData) => {
    if (!io) return;
    const stringTargetId = String(targetUserId);

    if (onlineUsers.has(stringTargetId)) {
      io.to(`user_${stringTargetId}`).emit(eventName, eventData);
      console.log(
        `📡 [BRIDGE] Mượn cổng truyền '${eventName}' tới ROOM [user_${stringTargetId}]`,
      );
    } else {
      console.log(
        `📴 [BRIDGE] Không thể truyền '${eventName}', User ${targetUserId} offline.`,
      );
    }
  },
};
