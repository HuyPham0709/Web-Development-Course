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

            // Khi user đăng nhập/vào trang, gửi event 'add_user' kèm ID
            socket.on('add_user', (userId) => {
                onlineUsers.set(userId, socket.id);
            });

            // Gửi tin nhắn real-time
            socket.on('send_message', (data) => {
                const { receiverId, senderId, text, fileUrl, conversationId, createdAt } = data;
                const receiverSocketId = onlineUsers.get(receiverId);

                // Nếu user kia đang online, push tin nhắn trực tiếp
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', {
                        conversationId,
                        senderId,
                        text,
                        fileUrl,
                        createdAt: createdAt || new Date()
                    });
                }
            });

            socket.on('disconnect', () => {
                // Xóa user khỏi map khi disconnect
                for (let [key, value] of onlineUsers.entries()) {
                    if (value === socket.id) {
                        onlineUsers.delete(key);
                        break;
                    }
                }
                console.log('User disconnected:', socket.id);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) throw new Error('Socket.io is not initialized!');
        return io;
    }
};