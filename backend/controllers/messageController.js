const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// [GET] Lấy danh sách hội thoại của user hiện tại
exports.getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id; // Giả định req.user.id có từ authMiddleware
        const conversations = await Conversation.find({
            participants: { $in: [userId] }
        })
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
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

        // 3. Cập nhật last message
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        next(error);
    }
};