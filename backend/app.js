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
// 1. GLOBAL MIDDLEWARES (Cấu hình toàn cục)
// ─────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─────────────────────────────────────────────────────────────
// 2. IMPORT ROUTES & MIDDLEWARES (Đã sửa theo cấu trúc thư mục mới)
// ─────────────────────────────────────────────────────────────

// Phân hệ Auth
const authRoutes = require("./routes/auth/authRoutes");
const profileRoutes = require("./routes/auth/profileRoutes");

// Phân hệ Jobs
const jobRoutes = require("./routes/jobs/jobRoutes");
const categoryRoutes = require("./routes/jobs/categoryRoutes");
const locationRoutes = require("./routes/jobs/locationRoutes");
const jobCriteriaRoutes = require("./routes/jobs/jobCriteriaRoutes");
const skillRoutes = require("./routes/jobs/skillRoutes");

// Phân hệ Core
const applicationRoutes = require("./routes/core/applicationRoutes");
const companyRoutes = require("./routes/core/companyRoutes");
const cvBuilderRoutes = require("./routes/core/cvBuilderRoutes");
const candidateVisibilityRoutes = require("./routes/core/candidateVisibilityRoutes");
const employerCandidateRoutes = require("./routes/employer/employerCandidateRoutes");
const candidateViewRoutes = require('./routes/candidate/candidateViewRoutes');
const invitationRoutes = require("./routes/employer/invitationRoutes");

// Phân hệ Social
const favoriteRoutes = require("./routes/social/favoriteRoutes");
const recommendationRoutes = require("./routes/social/recommendationRoutes");
const notificationRoutes = require("./routes/social/notificationRoutes");
const messageRoutes = require("./routes/social/messageRoutes");

// Client Report (Nằm ngay trong thư mục routes gốc)
const routes = require('./routes/index');

// Phân hệ Admin Routes (Đã sửa lại viết hoa/thường theo đúng file tree)
const adminRoutes = require("./routes/admin/adminRoutes");
const adminUserRoutes = require("./routes/admin/userRoutes");
const adminJobRoutes = require("./routes/admin/adminJobRoutes");
const metadataRoutes = require("./routes/admin/metadataRoutes");
const adminReportRoutes = require("./routes/admin/reportRoutes"); 

// Custom Middlewares & Utils
const { verifyToken, authorizeRole } = require("./middlewares/authMiddleware");
const socketUtils = require("./utils/socket");
// ─────────────────────────────────────────────────────────────
// 3. API ROUTES CONFIGURATION (Đăng ký các tuyến đường)
// ─────────────────────────────────────────────────────────────

// Router tổng hợp (Có file routes/index.js nên dòng này hoạt động bình thường)
// app.use("/api", require("./routes/index"));

// Chi tiết các phân hệ Route chính (Client)
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/job-criteria", jobCriteriaRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);       
app.use("/api/cv-builder", cvBuilderRoutes);     
app.use("/api/candidate", candidateVisibilityRoutes);
app.use("/api/employer", employerCandidateRoutes);
app.use('/api/candidate', candidateViewRoutes);

// Route lời mời ứng tuyển
app.use("/api/invitations", invitationRoutes);

app.use('/api', routes);  

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
    message: "Posting successful!",
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("The JobFinder backend is working.! 🚀");
});

// ─────────────────────────────────────────────────────────────
// 5. ERROR HANDLER MIDDLEWARE (Phải đặt dưới cùng của các Route)
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
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️ Khởi động server chế độ Fallback (Không có MongoDB)...");
    
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on http://localhost:${PORT} (without MongoDB)`);
    });
  });