const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const db = require('../../config/db'); 
const socketModule = require('../../utils/socket');

// ======================================================================
// [GET] Lấy danh sách hội thoại của user hiện tại
// ======================================================================
exports.getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        
        // 1. Lấy danh sách phòng chat từ MongoDB
        const conversations = await Conversation.find({
            participants: { $in: [String(userId), userId] }
        })
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .lean(); 

        // 2. Chạy vòng lặp để đính kèm thông tin Tên & Avatar từ MySQL
        const enrichedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const targetUserId = conv.participants.find(id => String(id) !== String(userId));
                
                let targetUser = { 
                    id: targetUserId, 
                    name: "Người dùng ẩn danh", 
                    avatar_url: "" 
                };

                if (targetUserId) {
                    const [userRows] = await db.query(
                        'SELECT id, username, email, role FROM Users WHERE id = ?', 
                        [targetUserId]
                    );

                    if (userRows.length > 0) {
                        const user = userRows[0];
                        targetUser.username = user.username;
                        targetUser.email = user.email;
                        targetUser.role = user.role;
                        targetUser.name = user.username; 

                        if (user.role === 'candidate') {
                            const [profileRows] = await db.query(
                                'SELECT full_name, avatar_url FROM Profiles WHERE user_id = ?', 
                                [user.id]
                            );
                            if (profileRows.length > 0) {
                                targetUser.name = profileRows[0].full_name || targetUser.name;
                                targetUser.avatar_url = profileRows[0].avatar_url || "";
                            }
                        } else if (user.role === 'employer') {
                            const [companyRows] = await db.query(
                                'SELECT c.name, c.logo_url FROM Companies c JOIN Users u ON c.id = u.company_id WHERE u.id = ?', 
                                [user.id]
                            );
                            if (companyRows.length > 0) {
                                targetUser.name = companyRows[0].name || targetUser.name;
                                targetUser.avatar_url = companyRows[0].logo_url || "";
                            }
                        }
                    }
                }

                // 🔥 LOGIC ĐỒNG BỘ CHUẨN XÁC 100%: 
                // Đếm trực tiếp các tin nhắn thuộc phòng chat này, KHÔNG PHẢI do mình gửi, và CÒN CHƯA ĐỌC.
                // (Nếu Model Message của bạn dùng trường `is_read` thay vì `isRead`, hãy sửa lại chữ isRead bên dưới nhé)
                const realUnreadCount = await Message.countDocuments({
                    conversationId: conv._id,
                    senderId: { $ne: String(userId) }, // Của người khác gửi
                    isRead: false                      // Trạng thái chưa đọc
                });

                return {
                    ...conv,
                    unreadCount: realUnreadCount, // Trả về con số chính xác nhất cho Navbar hiển thị
                    targetUser
                };
            })
        );

        res.status(200).json({ success: true, data: enrichedConversations });
    } catch (error) {
        console.error("Lỗi getConversations:", error);
        next(error);
    }
};

// ======================================================================
// [GET] Lấy tin nhắn của 1 hội thoại (Đồng thời XÓA số lượng chưa đọc)
// ======================================================================
exports.getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // 1. Reset unreadCount trong Collection Conversation
        await Conversation.updateOne(
            { _id: conversationId },
            { $set: { unreadCount: 0 } }
        );

        // 2. 🔥 FIX QUAN TRỌNG: Phải đánh dấu toàn bộ tin nhắn của đối phương là "đã đọc" (isRead: true)
        // Nếu không làm bước này, hàm đếm countDocuments ở trên sẽ luôn ra kết quả > 0
        await Message.updateMany(
            { 
                conversationId: conversationId, 
                senderId: { $ne: String(userId) },
                isRead: false 
            },
            { $set: { isRead: true } }
        );

        // Lấy danh sách tin nhắn để hiển thị
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

// ======================================================================
// [POST] Gửi tin nhắn HTTP (Đã tích hợp lưu trữ unreadCount vào Database)
// ======================================================================
exports.sendMessage = async (req, res, next) => {
    try {
        const { receiverId, text, fileUrl } = req.body;
        const senderId = req.user.id;

        if (!receiverId) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin người nhận (receiverId)." });
        }

        // 1. Tìm hoặc tạo cuộc hội thoại trong MongoDB
        let conversation = await Conversation.findOne({
            participants: { $all: [String(senderId), String(receiverId)] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [String(senderId), String(receiverId)],
                unreadCount: 0
            });
        }

        // 2. Lưu tin nhắn mới vào MongoDB (Set rõ trạng thái là chưa đọc)
        const newMessage = await Message.create({
            conversationId: conversation._id,
            senderId: String(senderId),
            text,
            fileUrl,
            isRead: false // Mặc định tin nhắn mới là chưa đọc
        });

        // 3. Logic phụ (Giữ nguyên của bạn để caching unreadCount nếu cần)
        if (conversation.lastSenderId && String(conversation.lastSenderId) !== String(senderId)) {
            conversation.unreadCount = 1;
        } else {
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        conversation.lastMessage = newMessage._id;
        conversation.lastSenderId = String(senderId);
        await conversation.save();

        // ✅ CẦU NỐI REALTIME
        try {
            // Gửi tin nhắn cho người nhận
            socketModule.emitToUser(receiverId, 'receive_message', {
                ...newMessage._doc // Gửi toàn bộ data tin nhắn
            });

            // Kích hoạt cập nhật unread (Chỉ gửi cho người nhận)
            socketModule.emitToUser(receiverId, 'update_unread_total');

            // Gửi gói thông báo đẩy lên Quả chuông
            const chatNotificationPayload = {
                _id: `chat_msg_${Date.now()}`,
                title: "Tin nhắn mới",
                message: text || (fileUrl ? "📷 Đã gửi một tệp đính kèm..." : ""),
                created_at: new Date().toISOString(),
                is_read: false,
                link_url: "/chat"
            };
            socketModule.sendNotification(receiverId, chatNotificationPayload);

        } catch (socketBridgeErr) {
            console.error("⚠️ Lỗi chuyển tiếp dữ liệu qua cổng Socket Bridge:", socketBridgeErr.message);
        }

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        console.error("Lỗi khi chạy sendMessage API:", error);
        next(error);
    }
};

// ======================================================================
// [DELETE] Xóa cuộc trò chuyện và tất cả tin nhắn liên quan
// ======================================================================
exports.deleteConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: { $in: [String(userId), userId] }
        });

        if (!conversation) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền xóa." 
            });
        }

        await Message.deleteMany({ conversationId });
        await Conversation.findByIdAndDelete(conversationId);

        res.status(200).json({ 
            success: true, 
            message: "Xóa đoạn chat thành công." 
        });
    } catch (error) {
        next(error);
    }
};