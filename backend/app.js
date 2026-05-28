require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────
// 1. IMPORT ROUTES & MIDDLEWARES
// ─────────────────────────────────────────────────────────────

// Main Routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const locationRoutes = require("./routes/locationRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const companyRoutes = require("./routes/companyRoutes");
const skillRoutes = require("./routes/skillRoutes");
const jobCriteriaRoutes = require("./routes/jobCriteriaRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const cvBuilderRoutes = require("./routes/cvBuilderRoutes");
const candidateVisibilityRoutes = require('./routes/candidateVisibilityRoutes');
const reportRoutes = require('./routes/reportRoutes'); // Route Report của Client

// Admin Routes
const adminRoutes = require("./routes/admin/adminRoutes");
const adminUserRoutes = require("./routes/admin/Userroutes");
const adminJobRoutes = require("./routes/admin/adminJobRoutes");
const metadataRoutes = require("./routes/admin/metadataRoutes");
const adminReportRoutes = require("./routes/admin/Reportroutes"); 

// Middlewares & Utils
const { verifyToken, authorizeRole } = require("./middlewares/authMiddleware");
const socketUtils = require("./utils/socket");

// ─────────────────────────────────────────────────────────────
// 2. GLOBAL MIDDLEWARES
// ─────────────────────────────────────────────────────────────

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─────────────────────────────────────────────────────────────
// 3. API ROUTES CONFIGURATION
// ─────────────────────────────────────────────────────────────

// Central Router (Nếu có file index tổng)
app.use("/api", require("./routes/index"));

// Chi tiết các phân hệ Route chính
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/job-criteria", jobCriteriaRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);       // Chat
app.use("/api/cv-builder", cvBuilderRoutes);     // CV Builder
app.use('/api/candidate', candidateVisibilityRoutes);
app.use("/api/reports", reportRoutes);           // Client Report

// Phân hệ Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/jobs", adminJobRoutes);
app.use("/api/admin/metadata", metadataRoutes);
app.use("/api/admin/reports", adminReportRoutes);

// ─────────────────────────────────────────────────────────────
// 4. TEST ROUTE & ROOT ROUTE
// ─────────────────────────────────────────────────────────────

app.post("/api/jobs/create", verifyToken, authorizeRole(["employer"]), (req, res) => {
  res.json({
    message: "Đăng tin thành công!",
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("Backend JobFinder đang hoạt động! 🚀");
});

// ─────────────────────────────────────────────────────────────
// 5. ERROR HANDLER MIDDLEWARE
// ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("LỖI SERVER:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi Server Internal",
  });
});

// ─────────────────────────────────────────────────────────────
// 6. DATABASE CONNECT & SERVER STARTUP
// ─────────────────────────────────────────────────────────────

// Khởi tạo Socket.io sẵn sàng nhận kết nối
socketUtils.init(server);

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/job_finder_chat_db",
    { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 }
  )
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️ Vẫn start server dù MongoDB lỗi (Các dịch vụ khác như MySQL vẫn hoạt động)");
    
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} (without MongoDB)`);
    });
  });