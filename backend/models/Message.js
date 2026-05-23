const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        type: Number, // ID lấy từ hệ thống MySQL
        required: true
    },
    text: {
        type: String,
        default: ''
    },
    fileUrl: {
        type: String, // Dành cho link ảnh/file từ Cloudinary
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);