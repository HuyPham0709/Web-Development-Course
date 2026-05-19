const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path'); // ← thêm dòng này

// Import Routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const locationRoutes = require('./routes/locationRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { verifyToken, authorizeRole } = require('./middlewares/authMiddleware');

require('dotenv').config();

// 1. Cấu hình Middlewares cơ bản
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));


// --- QUAN TRỌNG: SỬA Ở ĐÂY ĐỂ HẾT LỖI PAYLOAD TOO LARGE ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// -------------------------------------------------------

app.use(express.json()); // Đọc dữ liệu JSON từ req.body
app.use(express.urlencoded({ extended: true }));

// Sử dụng routes
app.use('/api/auth', authRoutes);


app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);

app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);



// Serve file upload tĩnh (ảnh avatar, cover, CV...)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
// app.use("/api", applicationRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Lỗi server nội bộ!'
    });
});

// THÊM DÒNG NÀY CHO ADMIN:
app.use('/api/admin', require('./routes/admin/adminRoutes'));
app.use('/api/admin/users', require('./routes/admin/Userroutes'));
app.use('/api/admin/jobs', require('./routes/admin/adminJobRoutes'));
app.use('/api/admin/metadata', require('./routes/admin/metadataRoutes'));
app.use('/api/admin/reports', require('./routes/admin/reportRoutes'));
// 2. Import Routes (Sau này bạn sẽ import authRoutes, jobRoutes vào đây)
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);




// 2. Sử dụng routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);


// Route test cho Employer
app.post('/api/jobs/create', verifyToken, authorizeRole(['employer']), (req, res) => {
    res.json({
        message: 'Đăng tin thành công!',
        user: req.user
    });
});

app.get('/', (req, res) => {
    res.send('Backend JobFinder đang hoạt động!');
});

// 3. Error Handler Middleware (Hứng lỗi tập trung)
app.use((err, req, res, next) => {
    console.error("LỖI SERVER:", err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Lỗi server nội bộ!'
    });
});

// 4. Khởi động Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});