const express = require('express');
const router = express.Router();

// ─────────────────────────────────────────────────────────────
// 1. IMPORT CONTROLLERS & MIDDLEWARES
// ─────────────────────────────────────────────────────────────
// Lưu ý: Hãy kiểm tra chính xác thư mục chứa messageController của bạn 
// là '../controllers/' hay '../controllers/social/' để tránh lỗi Cannot find module
const messageController = require('../../controllers/social/messageController');
const chatbotController = require('../../controllers/social/chatbotController');
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

// ─────────────────────────────────────────────────────────────
// 2. PUBLIC ROUTES (Không cần đăng nhập)
// ─────────────────────────────────────────────────────────────
// Route Chatbot xử lý AI trả về tự động, đặt trước middleware verifyToken
router.post('/bot', chatbotController.chatWithBot);

// ─────────────────────────────────────────────────────────────
// 3. PROTECTED ROUTES (Bắt buộc phải đăng nhập)
// ─────────────────────────────────────────────────────────────
// Middleware này sẽ bảo vệ toàn bộ các route được khai báo phía bên dưới nó
router.use(verifyToken); 
router.get('/unread', messageController.getUnreadCount);
// Lấy danh sách các cuộc hội thoại công việc/cá nhân
router.get('/conversations', messageController.getConversations);

// Gửi tin nhắn mới trong đoạn chat
router.post('/send', messageController.sendMessage);

// Xóa toàn bộ cuộc hội thoại (Đã bỏ verifyToken thừa vì có router.use phía trên)
router.delete('/conversations/:conversationId', messageController.deleteConversation);

// Lấy chi tiết tin nhắn theo ID cuộc hội thoại (Đặt ở CUỐI CÙNG để tránh tranh chấp route dạng /:id)
router.get('/:conversationId', messageController.getMessages);

module.exports = router;