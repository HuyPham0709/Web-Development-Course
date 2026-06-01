const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const db = require('../../config/db'); 
const socketModule = require('../../utils/socket');

// Hàm Helper lấy thông tin vai trò và công ty của User từ MySQL
const getUserContext = async (userId) => {
    const [rows] = await db.query('SELECT role, company_id FROM Users WHERE id = ?', [userId]);
    return rows.length > 0 ? rows[0] : null;
};

// ======================================================================
// [GET] Lấy danh sách hội thoại (ĐÃ FIX LỖI ẨN CHAT EMPLOYER)
// ======================================================================
exports.getConversations = async (req, res, next) => {
    try {
        const userId = Number(req.user.id); 
        const userContext = await getUserContext(userId);
        
        if (!userContext) return res.status(404).json({ success: false, message: "No user found" });

        let query = {};
        let isCandidate = userContext.role === 'candidate';

        // Tìm kiếm thông minh chấp nhận cả cấu trúc Schema cũ (participants) lẫn mới (Id riêng lẻ)
        if (isCandidate) {
            query = {
                $or: [
                    { candidateId: userId },
                    { participants: userId }
                ]
            };
        } else {
            // Nếu tài khoản Employer chưa gán vào công ty nào, trả về rỗng để bảo mật
            if (!userContext.company_id) return res.status(200).json({ success: true, data: [] });
            query = {
                $or: [
                    { companyId: userContext.company_id },
                    { participants: userContext.company_id }
                ]
            };
        }

        const conversations = await Conversation.find(query)
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .lean(); 

        const enrichedConversations = await Promise.all(
            conversations.map(async (conv) => {
                let targetUser = { id: "", name: "Anonymous", avatar_url: "" };
                
                // Trích xuất an toàn các ID bất kể tình trạng Schema hiện tại của bạn
                const currentCandidateId = conv.candidateId || (conv.participants && conv.participants[0]);
                const currentCompanyId = conv.companyId || (conv.participants && conv.participants[1]);

                if (isCandidate) {
                    // Ứng viên đang xem chat -> Lấy thông tin hiển thị là đối phương (Công Ty)
                    if (currentCompanyId) {
                        const [companyRows] = await db.query(
                            `SELECT id, name, logo_url FROM Companies WHERE id = ?`, 
                            [currentCompanyId]
                        );
                        if (companyRows.length > 0) {
                            targetUser = { 
                                id: companyRows[0].id, 
                                name: companyRows[0].name, 
                                avatar_url: companyRows[0].logo_url || "" 
                            };
                        }
                    }
                } else {
                    // NTD đang xem chat -> Lấy thông tin hiển thị là đối phương (Ứng viên)
                    if (currentCandidateId) {
                        const [candidateRows] = await db.query(
                            `SELECT u.id, p.full_name, p.avatar_url, u.username 
                             FROM Users u 
                             LEFT JOIN Profiles p ON u.id = p.user_id 
                             WHERE u.id = ?`, 
                            [currentCandidateId]
                        );
                        if (candidateRows.length > 0) {
                            targetUser = { 
                                id: candidateRows[0].id, 
                                name: candidateRows[0].full_name || candidateRows[0].username, 
                                avatar_url: candidateRows[0].avatar_url || "" 
                            };
                        }
                    }
                }

                // 🔥 ĐIỂM MẤT CHỐT: Tạo mảng giả lập tương thích gửi về cho Frontend (Chat.tsx)
                // Cần nạp chính xác userId của Employer hiện tại vào mảng để vượt qua bộ lọc Client .includes()
                const mockParticipants = isCandidate 
                    ? [userId, Number(targetUser.id || currentCompanyId)] 
                    : [Number(targetUser.id || currentCandidateId), userId];

                return { 
                    ...conv, 
                    candidateId: currentCandidateId,
                    companyId: currentCompanyId,
                    participants: mockParticipants, // Cứu cánh cấu trúc mảng cho Frontend
                    targetUser 
                };
            })
        );

        res.status(200).json({ success: true, data: enrichedConversations });
    } catch (error) {
        next(error);
    }
};

// ======================================================================
// [POST] Gửi tin nhắn mới (ĐỒNG BỘ CẢ HAI CẤU TRÚC LƯU TRỮ)
// ======================================================================
exports.sendMessage = async (req, res, next) => {
    try {
        const senderId = Number(req.user.id);
        const targetId = Number(req.body.receiverId); 
        
        if (!targetId || isNaN(targetId)) {
            return res.status(400).json({ success: false, message: "Invalid recipient ID" });
        }

        const userContext = await getUserContext(senderId);
        if (!userContext) return res.status(404).json({ success: false, message: "User not found" });

        let candidateId, companyId;

        if (userContext.role === 'candidate') {
            candidateId = senderId;
            companyId = targetId; 
        } else {
            companyId = userContext.company_id; 
            candidateId = targetId; 
        }

        if (!companyId) return res.status(400).json({ success: false, message: "Employer is not associated with any company" });

        // Tìm kiếm bằng $or để check cả 2 kiểu viết của DB nhằm tránh duplicate phòng chat
        let conversation = await Conversation.findOne({
            $or: [
                { candidateId, companyId },
                { participants: { $all: [candidateId, companyId] } }
            ]
        });

        if (!conversation) {
            conversation = await Conversation.create({
                candidateId,
                companyId,
                participants: [candidateId, companyId], // Gán cả mảng lẫn trường rời rạc
                unreadCount: 0
            });
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            senderId,
            text: req.body.text || "",
            fileUrl: req.body.fileUrl || "",
            isRead: false
        });

        conversation.lastMessage = newMessage._id;
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        conversation.lastSenderId = senderId;
        await conversation.save();

        // Phát tín hiệu thông báo realtime
        try {
            if (userContext.role === 'candidate') {
                const [employers] = await db.query(
                    'SELECT id FROM Users WHERE company_id = ? AND role = "employer"', 
                    [companyId]
                );
                employers.forEach(emp => {
                    socketModule.sendNotification(emp.id, {
                        type: "chat", title: "New message", message: "Your company has received a message from a candidate", is_read: false, link_url: "/chat"
                    });
                });
            } else {
                socketModule.sendNotification(candidateId, {
                    type: "chat", title: "New message", message: "You have a new message from an Employer", is_read: false, link_url: "/chat"
                });
            }
        } catch (e) {
            console.error("Lỗi gửi socket notification:", e);
        }

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        next(error);
    }
};

// ======================================================================
// [GET] Lấy tin nhắn chi tiết
// ======================================================================
exports.getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

// ======================================================================
// [DELETE] Xóa cuộc trò chuyện
// ======================================================================
exports.deleteConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userId = Number(req.user.id);
        const userContext = await getUserContext(userId);

        if (!userContext) return res.status(404).json({ success: false, message: "User not found." });

        let query = { _id: conversationId };
        
        if (userContext.role === 'candidate') {
            query.$or = [
                { candidateId: userId },
                { participants: userId }
            ];
        } else if (userContext.company_id) {
            query.$or = [
                { companyId: userContext.company_id },
                { participants: userContext.company_id }
            ];
        } else {
            return res.status(403).json({ success: false, message: "You do not have permission to delete this conversation." });
        }

        const conversation = await Conversation.findOne(query);

        if (!conversation) {
            return res.status(404).json({ 
                success: false, 
                message: "Conversation not found or you do not have permission to delete it." 
            });
        }

        await Message.deleteMany({ conversationId });
        await Conversation.findByIdAndDelete(conversationId);

        res.status(200).json({ success: true, message: "Conversation deleted successfully." });
    } catch (error) {
        next(error);
    }
};

// ======================================================================
// [GET] Lấy tổng số tin nhắn chưa đọc
// ======================================================================
exports.getUnreadCount = async (req, res, next) => {
    try {
        const userId = Number(req.user.id);
        const userContext = await getUserContext(userId);
        
        if (!userContext) return res.status(200).json({ success: true, data: 0 });

        let query = {};
        if (userContext.role === 'candidate') {
            query = {
                $or: [
                    { candidateId: userId },
                    { participants: userId }
                ]
            };
        } else {
            if (!userContext.company_id) return res.status(200).json({ success: true, data: 0 });
            query = {
                $or: [
                    { companyId: userContext.company_id },
                    { participants: userContext.company_id }
                ]
            };
        }

        const conversations = await Conversation.find(query).lean();

        let totalUnread = 0;
        conversations.forEach(conv => {
            const senderId = conv.lastSenderId;
            if (senderId && Number(senderId) !== userId) {
                totalUnread += Number(conv.unreadCount || 0);
            }
        });

        res.status(200).json({ success: true, data: totalUnread });
    } catch (error) {
        console.error("Error counting unread messages:", error);
        next(error);
    }
};