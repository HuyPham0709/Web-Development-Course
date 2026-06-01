// backend/routes/index.js
const express = require('express');
const router = express.Router();

// ─────────────────────────────────────────────────────────────
// 1. Nhóm Admin
// ─────────────────────────────────────────────────────────────
const adminRoutes = require("./admin/adminRoutes");
const adminUserRoutes = require("./admin/userRoutes"); 
const adminJobRoutes = require("./admin/adminJobRoutes");
const metadataRoutes = require("./admin/metadataRoutes");
const adminReportRoutes = require("./admin/reportRoutes")

// ─────────────────────────────────────────────────────────────
// 2. Nhóm Auth & Profile
// ─────────────────────────────────────────────────────────────
const authRoutes = require("./auth/authRoutes");
const profileRoutes = require("./auth/profileRoutes");

// ─────────────────────────────────────────────────────────────
// 3. Nhóm Jobs & Cấu hình liên quan
// ─────────────────────────────────────────────────────────────
const jobRoutes = require("./jobs/jobRoutes");
const categoryRoutes = require("./jobs/categoryRoutes");
const locationRoutes = require("./jobs/locationRoutes");
const skillRoutes = require("./jobs/skillRoutes");
const jobCriteriaRoutes = require("./jobs/jobCriteriaRoutes");

// ─────────────────────────────────────────────────────────────
// 4. Nhóm Core (Tính năng chính)
// ─────────────────────────────────────────────────────────────
const companyRoutes = require("./core/companyRoutes");
const applicationRoutes = require("./core/applicationRoutes");
const cvBuilderRoutes = require("./core/cvBuilderRoutes");
const candidateVisibilityRoutes = require('./core/candidateVisibilityRoutes');
const employerCandidateRoutes = require('./employer/employerCandidateRoutes');
const invitationRoutes = require("./employer/invitationRoutes"); // ✅ ĐÃ THÊM: Import tuyến đường Lời mời ứng tuyển

// ─────────────────────────────────────────────────────────────
// 5. Nhóm Social (Tương tác & Kết nối)
// ─────────────────────────────────────────────────────────────
const messageRoutes = require("./social/messageRoutes");
const notificationRoutes = require("./social/notificationRoutes");
const favoriteRoutes = require("./social/favoriteRoutes");
const recommendationRoutes = require("./social/recommendationRoutes");


// ─────────────────────────────────────────────────────────────
// 🛠️ CƠ CHẾ KIỂM TRA LỖI VÀ CHỐNG SẬP SERVER
// ─────────────────────────────────────────────────────────────
function safeRegisterRoute(path, routeModule, variableName) {
  if (typeof routeModule === 'function') {
    router.use(path, routeModule);
  } else {
    console.error(`\n=============================================================`);
    console.error(`🚨 [PHÁT HIỆN FILE LỖI]: Tuyến đường "${path}" đang bị hỏng!`);
    console.error(`👉 Biến lỗi: ${variableName}`);
    console.error(`📌 LÝ DO: File này chưa có 'module.exports = router' ở cuối file, hoặc bị export sai.`);
    console.error(`=============================================================\n`);
  }
}


// ─────────────────────────────────────────────────────────────
// ĐỊNH NGHĨA PREFIX URL (Đã bọc tính năng an toàn)
// ─────────────────────────────────────────────────────────────

// Phân hệ Admin
safeRegisterRoute("/admin", adminRoutes, "adminRoutes");
safeRegisterRoute("/admin/users", adminUserRoutes, "adminUserRoutes");
safeRegisterRoute("/admin/jobs", adminJobRoutes, "adminJobRoutes");
safeRegisterRoute("/admin/metadata", metadataRoutes, "metadataRoutes");
safeRegisterRoute("/admin/reports", adminReportRoutes, "adminReportRoutes");

// Phân hệ Auth & Profile
safeRegisterRoute("/auth", authRoutes, "authRoutes");
safeRegisterRoute("/profile", profileRoutes, "profileRoutes");

// Phân hệ Jobs
safeRegisterRoute("/jobs", jobRoutes, "jobRoutes");
safeRegisterRoute("/categories", categoryRoutes, "categoryRoutes");
safeRegisterRoute("/locations", locationRoutes, "locationRoutes");
safeRegisterRoute("/skills", skillRoutes, "skillRoutes");
safeRegisterRoute("/job-criteria", jobCriteriaRoutes, "jobCriteriaRoutes");

// Phân hệ Core
safeRegisterRoute("/companies", companyRoutes, "companyRoutes");
safeRegisterRoute("/applications", applicationRoutes, "applicationRoutes");
safeRegisterRoute("/cv-builder", cvBuilderRoutes, "cvBuilderRoutes");
safeRegisterRoute("/candidate", candidateVisibilityRoutes, "candidateVisibilityRoutes");
safeRegisterRoute("/employer", employerCandidateRoutes, "employerCandidateRoutes");
safeRegisterRoute("/invitations", invitationRoutes, "invitationRoutes"); // ✅ ĐÃ THÊM: Kích hoạt đường dẫn /api/invitations

// Phân hệ Social
safeRegisterRoute("/messages", messageRoutes, "messageRoutes");
safeRegisterRoute("/notifications", notificationRoutes, "notificationRoutes");
safeRegisterRoute("/favorites", favoriteRoutes, "favoriteRoutes");
safeRegisterRoute("/recommendations", recommendationRoutes, "recommendationRoutes");

module.exports = router;