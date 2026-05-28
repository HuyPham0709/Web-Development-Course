const express = require('express');
const router = express.Router();

// ─────────────────────────────────────────────────────────────
// 1. Nhóm Admin
// ─────────────────────────────────────────────────────────────
const adminRoutes = require("./admin/adminRoutes");
const adminUserRoutes = require("./admin/Userroutes");
const adminJobRoutes = require("./admin/adminJobRoutes");
const metadataRoutes = require("./admin/metadataRoutes");
const reportRoutes = require("./admin/Reportroutes");

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

// ─────────────────────────────────────────────────────────────
// 5. Nhóm Social (Tương tác & Kết nối)
// ─────────────────────────────────────────────────────────────
const messageRoutes = require("./social/messageRoutes");
const notificationRoutes = require("./social/notificationRoutes");
const favoriteRoutes = require("./social/favoriteRoutes");
const recommendationRoutes = require("./social/recommendationRoutes");


// ─────────────────────────────────────────────────────────────
// ĐỊNH NGHĨA PREFIX URL
// ─────────────────────────────────────────────────────────────

// Admin
router.use("/admin", adminRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/admin/jobs", adminJobRoutes);
router.use("/admin/metadata", metadataRoutes);
router.use("/admin/reports", reportRoutes);

// Auth & Profile
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);

// Jobs
router.use("/jobs", jobRoutes);
router.use("/categories", categoryRoutes);
router.use("/locations", locationRoutes);
router.use("/skills", skillRoutes);
router.use("/job-criteria", jobCriteriaRoutes);

// Core
router.use("/companies", companyRoutes);
router.use("/applications", applicationRoutes);
router.use("/cv-builder", cvBuilderRoutes);
router.use('/candidate', candidateVisibilityRoutes);

// Social
router.use("/messages", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/recommendations", recommendationRoutes);

module.exports = router;