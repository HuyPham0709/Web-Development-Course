const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    // Lưu mảng ID của các user tham gia (từ MySQL)
    participants: [{ 
        type: Number, 
        required: true 
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);