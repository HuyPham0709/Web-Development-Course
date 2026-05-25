const { Server } = require('socket.io');

let io;
// Lưu trữ users online mapping: { userId: socketId }
const onlineUsers = new Map(); 

module.exports = {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:5173",
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            // Khi user đăng nhập/vào trang (Giữ nguyên logic cũ)
            socket.on('add_user', (userId) => {
                if (userId) {
                    // Ép kiểu sang String để tránh lệch kiểu dữ liệu giữa các bên
                    onlineUsers.set(String(userId), socket.id);
                    io.emit('get_online_users', Array.from(onlineUsers.keys()));
                    console.log(`👤 User ${userId} đã đăng ký socket: ${socket.id}`);
                }
            });

            // Gửi tin nhắn real-time (Đã tích hợp thêm bắn thông báo)
            socket.on('send_message', (data) => {
                const { receiverId, senderId, text, fileUrl, conversationId, createdAt } = data;
                const receiverSocketId = onlineUsers.get(String(receiverId));

                // 1. Logic cũ: Đẩy tin nhắn vào màn hình nếu đối phương đang trực tiếp mở ô chat
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', {
                        conversationId,
                        senderId,
                        text,
                        fileUrl,
                        createdAt: createdAt || new Date()
                    });
                }

                // ======================================================================
                // LOGIC MỚI: TỰ ĐỘNG ĐÓNG GÓI VÀ BẮN THÔNG BÁO LÊN NAVBAR REAL-TIME
                // ======================================================================
                const chatNotificationPayload = {
                    _id: `chat_msg_${Date.now()}`, // Tạo ID tạm thời unique
                    title: "Tin nhắn mới", 
                    message: text || (fileUrl ? "📷 Đã gửi một tệp đính kèm..." : ""),
                    created_at: new Date().toISOString(),
                    is_read: false,
                    link_url: "/chat" // Nhấp vào quả chuông sẽ tự động chuyển hướng đến trang chat
                };

                // Gọi hàm sendNotification ở dưới để đẩy thẳng data lên thanh Navbar người nhận
                module.exports.sendNotification(receiverId, chatNotificationPayload);
            });

            socket.on('disconnect', () => {
                // Xóa user khỏi map khi disconnect
                for (let [key, value] of onlineUsers.entries()) {
                    if (value === socket.id) {
                        onlineUsers.delete(key);
                        break;
                    }
                }
                // Cập nhật lại danh sách online khi có người thoát
                io.emit('get_online_users', Array.from(onlineUsers.keys()));
                console.log('User disconnected:', socket.id);
            });
        });

        return io;
    },

    getIO: () => {
        if (!io) throw new Error('Socket.io is not initialized!');
        return io;
    },

    // Chức năng bắn thông báo đích danh (dùng cho cả chat lẫn các API controller khác)
    sendNotification: (targetUserId, notificationData) => {
        if (!io) return;
        
        // Tìm socketId của người nhận dựa vào map onlineUsers
        const targetSocketId = onlineUsers.get(String(targetUserId));
        
        if (targetSocketId) {
            io.to(targetSocketId).emit('receive_notification', notificationData);
            console.log(`⚡ Đã bắn real-time thông báo tới User ${targetUserId}`);
        } else {
            console.log(`📴 User ${targetUserId} đang offline, thông báo sẽ đợi hiển thị khi họ F5.`);
        }
    }
};