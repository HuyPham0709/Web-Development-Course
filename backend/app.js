require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const mongoose = require("mongoose");
const socketUtils = require("./utils/socket");

const app = express();
const server = http.createServer(app); // Khởi tạo server 1 lần duy nhất ở đây
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────
// Middlewares cấu hình toàn cục
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
// API Central Router (Gọi duy nhất file index vừa tạo)
// ─────────────────────────────────────────────────────────────
app.use("/api", require("./routes/index"));

// Root Route
app.get("/", (req, res) => {
  res.send("Backend JobFinder đang hoạt động! 🚀");
});

// ─────────────────────────────────────────────────────────────
// Error Handler Middleware
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("LỖI SERVER:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi Server Internal",
  });
});

// ─────────────────────────────────────────────────────────────
// Kết nối Database & Khởi động Server
// ─────────────────────────────────────────────────────────────
// Khởi tạo socket sẵn sàng
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
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} (without MongoDB)`);
    });
  });