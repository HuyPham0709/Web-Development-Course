// backend/models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    candidateId: { 
        type: Number, 
        required: true,
        index: true // Thêm index để query nhanh hơn
    },
    companyId: { 
        type: Number, 
        required: true,
        index: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    unreadCount: {
        type: Number,
        default: 0
    },
    lastSenderId: {
        type: Number
    }
}, { timestamps: true });

// Đảm bảo mỗi ứng viên chỉ có 1 đoạn chat duy nhất với 1 công ty
conversationSchema.index({ candidateId: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);