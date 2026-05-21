const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const db = require('../config/db'); // THÊM DÒNG NÀY: Kết nối MySQL để lấy thông tin User

// [GET] Lấy danh sách hội thoại của user hiện tại
exports.getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id; // Giả định req.user.id có từ authMiddleware
        
        // 1. Lấy danh sách phòng chat từ MongoDB
        const conversations = await Conversation.find({
            participants: { $in: [userId] }
        })
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .lean(); // Dùng .lean() để chuyển Document thành Object thường, giúp ta dễ thêm field

        // 2. Chạy vòng lặp để đính kèm thông tin Tên & Avatar từ MySQL cho từng phòng chat
        const enrichedConversations = await Promise.all(
            conversations.map(async (conv) => {
                // Lấy ID của người đối diện (người chat cùng mình)
                const targetUserId = conv.participants.find(id => id !== userId);
                
                // Khởi tạo mặc định
                let targetUser = { 
                    id: targetUserId, 
                    name: "Người dùng ẩn danh", 
                    avatar_url: "" 
                };

                if (targetUserId) {
                    // Bước 2.1: Lấy role và username từ bảng Users
                    const [userRows] = await db.query(
                        'SELECT id, username, email, role FROM Users WHERE id = ?', 
                        [targetUserId]
                    );

                    if (userRows.length > 0) {
                        const user = userRows[0];
                        targetUser.username = user.username;
                        targetUser.email = user.email;
                        targetUser.role = user.role;
                        targetUser.name = user.username; // Fallback lấy username làm tên tạm thời

                        // Bước 2.2: Lấy Tên thật & Avatar dựa trên Role
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

                // Trả về cuộc hội thoại đã được đính kèm cục targetUser hoàn chỉnh
                return {
                    ...conv,
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

// [GET] Lấy tin nhắn của 1 hội thoại
exports.getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

// [POST] Gửi tin nhắn HTTP (Tạo hội thoại nếu chưa có)
exports.sendMessage = async (req, res, next) => {
    try {
        const { receiverId, text, fileUrl } = req.body;
        const senderId = req.user.id;

        // 1. Tìm hoặc tạo conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        // 2. Tạo tin nhắn
        const newMessage = await Message.create({
            conversationId: conversation._id,
            senderId,
            text,
            fileUrl
        });

        // 3. Cập nhật lastMessage
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        next(error);
    }
};