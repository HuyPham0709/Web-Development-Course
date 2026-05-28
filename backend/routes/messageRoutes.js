// backend/routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// 1. Import chatbotController mới tạo
const chatbotController = require('../controllers/chatbotController'); 

const { verifyToken } = require('../middlewares/authMiddleware'); 

// 2. Trỏ route /bot qua Controller mới (Vẫn để TRƯỚC verifyToken)
router.post('/bot', chatbotController.chatWithBot);

// ====================================================================
// Các Route bên dưới bắt buộc phải đăng nhập
// ====================================================================
router.use(verifyToken); 

router.get('/conversations', messageController.getConversations);
router.get('/:conversationId', messageController.getMessages);
router.post('/send', messageController.sendMessage);
router.delete('/conversations/:conversationId', verifyToken, messageController.deleteConversation);

module.exports = router;