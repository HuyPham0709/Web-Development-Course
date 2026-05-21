const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const http = require('http'); // ← Bắt buộc thêm để chạy Socket.io
const mongoose = require('mongoose'); // ← Bắt buộc thêm để dùng MongoDB
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const locationRoutes = require('./routes/locationRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const companyRoutes = require('./routes/companyRoutes');
const skillRoutes = require('./routes/skillRoutes');
const { verifyToken, authorizeRole } = require('./middlewares/authMiddleware');
const jobCriteriaRoutes = require('./routes/jobCriteriaRoutes');

// Import Chat Routes & Socket
const messageRoutes = require('./routes/messageRoutes'); // ← Route cho tin nhắn
const socketUtils = require('./utils/socket'); // ← Khởi tạo Socket.io

// ==========================================
// 1. KẾT NỐI MONGODB (CHO TÍNH NĂNG CHAT)
// ==========================================
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_finder_chat_db')
    .then(() => console.log('✅ MongoDB connected for Chat successfully!'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ==========================================
// 2. CẤU HÌNH MIDDLEWARES CƠ BẢN
// ==========================================
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// --- QUAN TRỌNG: SỬA Ở ĐÂY ĐỂ HẾT LỖI PAYLOAD TOO LARGE ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cấu hình phục vụ file tĩnh
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// 3. ĐỊNH TUYẾN (ROUTES)
// ==========================================
// Admin Routes
app.use('/api/admin', require('./routes/admin/adminRoutes'));
app.use('/api/admin/users', require('./routes/admin/Userroutes'));
app.use('/api/admin/jobs', require('./routes/admin/adminJobRoutes'));
app.use('/api/admin/metadata', require('./routes/admin/metadataRoutes'));
app.use('/api/admin/reports', require('./routes/admin/Reportroutes'));

// Main Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/job-criteria', jobCriteriaRoutes);

// Chat Routes
app.use('/api/messages', messageRoutes); // ← Cắm route tin nhắn vào đây

// Route test cho Employer
app.post('/api/jobs/create', verifyToken, authorizeRole(['employer']), (req, res) => {
    res.json({
        message: 'Đăng tin thành công!',
        user: req.user
    });
});

app.get('/', (req, res) => {
    res.send('Backend JobFinder đang hoạt động! (Tích hợp MySQL + MongoDB + Socket.io)');
});

// ==========================================
// 4. ERROR HANDLER (HỨNG LỖI TẬP TRUNG)
// ==========================================
app.use((err, req, res, next) => {
    console.error("LỖI SERVER:", err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Lỗi Server Internal"
    });
});

// ==========================================
// 5. KHỞI ĐỘNG SERVER (HTTP + SOCKET.IO)
// ==========================================
const server = http.createServer(app); // Tạo HTTP server bọc Express app lại

// Khởi tạo Socket.io với server vừa tạo
socketUtils.init(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});