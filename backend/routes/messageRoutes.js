const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middlewares/authMiddleware'); 

// Dòng này giúp bảo vệ TẤT CẢ các route bên dưới (yêu cầu phải đăng nhập)
router.use(verifyToken); 

router.get('/conversations', messageController.getConversations);
router.get('/:conversationId', messageController.getMessages);
router.post('/send', messageController.sendMessage);
router.delete('/conversations/:conversationId', verifyToken, messageController.deleteConversation);

module.exports = router;