require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const mongoose = require("mongoose");

const app = express();

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

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

// Admin Routes
const adminRoutes = require("./routes/admin/adminRoutes");
const adminUserRoutes = require("./routes/admin/Userroutes");
const adminJobRoutes = require("./routes/admin/adminJobRoutes");
const metadataRoutes = require("./routes/admin/metadataRoutes");
const reportRoutes = require("./routes/admin/Reportroutes");

// Middleware
const {
  verifyToken,
  authorizeRole,
} = require("./middlewares/authMiddleware");

// Socket
const socketUtils = require("./utils/socket");

// ─────────────────────────────────────────────────────────────
// MongoDB Connection
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/job_finder_chat_db",
    {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  )
  .then(() => {
    console.log("✅ MongoDB connected successfully!");

    // Chỉ start server sau khi MongoDB đã connect
    const server = http.createServer(app);
    socketUtils.init(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);

    // Vẫn start server dù MongoDB lỗi (MySQL vẫn hoạt động)
    const server = http.createServer(app);
    socketUtils.init(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} (without MongoDB)`);
    });
  });
// ─────────────────────────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

// Static uploads
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────

// Main Routes
app.use("/api/auth", authRoutes);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/locations",
  locationRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use("/api/jobs", jobRoutes);

app.use(
  "/api/companies",
  companyRoutes
);

app.use("/api/skills", skillRoutes);

app.use(
  "/api/job-criteria",
  jobCriteriaRoutes
);

app.use(
  "/api/favorites",
  favoriteRoutes
);

app.use(
  "/api/recommendations",
  recommendationRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

// Chat
app.use(
  "/api/messages",
  messageRoutes
);

// ─────────────────────────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────────────────────────

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/admin/users",
  adminUserRoutes
);

app.use(
  "/api/admin/jobs",
  adminJobRoutes
);

app.use(
  "/api/admin/metadata",
  metadataRoutes
);

app.use(
  "/api/admin/reports",
  reportRoutes
);

// ─────────────────────────────────────────────────────────────
// Test Route
// ─────────────────────────────────────────────────────────────

app.post(
  "/api/jobs/create",
  verifyToken,
  authorizeRole(["employer"]),
  (req, res) => {
    res.json({
      message:
        "Đăng tin thành công!",
      user: req.user,
    });
  }
);

// ─────────────────────────────────────────────────────────────
// Root Route
// ─────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send(
    "Backend JobFinder đang hoạt động! 🚀"
  );
});

// ─────────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────────

app.use(
  (err, req, res, next) => {
    console.error(
      "LỖI SERVER:",
      err.message
    );

    res.status(err.status || 500).json({
      success: false,
      message:
        err.message ||
        "Lỗi Server Internal",
    });
  }
);

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────

// const server =
//   http.createServer(app);

// // Init Socket.io
// socketUtils.init(server);

// const PORT =
//   process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(
//     `🚀 Server is running on port ${PORT}`
//   );
// });