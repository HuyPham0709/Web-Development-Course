const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Giả định bạn có middleware này, nếu thư mục middleware cấu trúc khác thì sửa đường dẫn lại nhé
const { verifyToken } = require('../middlewares/authMiddleware'); 

router.use(verifyToken); 

router.get('/conversations', messageController.getConversations);
router.get('/:conversationId', messageController.getMessages);
router.post('/send', messageController.sendMessage);

// DÒNG NÀY RẤT QUAN TRỌNG, THIẾU SẼ GÂY RA LỖI NHƯ BẠN ĐANG GẶP:
module.exports = router;