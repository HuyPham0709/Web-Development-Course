const express = require("express");
const router = express.Router();

const applicationController = require("../../controllers/core/applicationController");
const { verifyToken, authorizeRole } = require("../../middlewares/authMiddleware");

// ======================================================
// CANDIDATE (ỨNG VIÊN)
// ======================================================
router.post("/apply", verifyToken, authorizeRole(["candidate"]), applicationController.applyJob);
router.get("/my", verifyToken, authorizeRole(["candidate"]), applicationController.getMyApplications);
router.delete("/withdraw/:id", verifyToken, authorizeRole(["candidate"]), applicationController.withdrawApplication);

// ======================================================
// EMPLOYER (NHÀ TUYỂN DỤNG)
// ======================================================
router.get("/employer/list", verifyToken, authorizeRole(["employer"]), applicationController.getEmployerApplications);
router.get("/employer/detail/:id", verifyToken, authorizeRole(["employer"]), applicationController.getApplicationById);
router.put("/update-status", verifyToken, authorizeRole(["employer"]), applicationController.updateApplicationStatus);
router.get("/employer/jobs", verifyToken, authorizeRole(["employer"]), applicationController.getEmployerJobs);

// Bảo mật API gửi lời mời phỏng vấn (Chỉ Employer được gọi)
router.post("/interview/invite", verifyToken, authorizeRole(["employer"]), applicationController.inviteInterview);

// ======================================================
// INTERVIEW WORKFLOW VIA EMAIL (ỨNG VIÊN PHẢN HỒI QUA EMAIL)
// Note: Không dùng verifyToken ở đây vì ứng viên click trực tiếp từ Email 
// tránh trường hợp họ bị logout trên trình duyệt điện thoại/máy tính.
// ======================================================
router.get('/interview/accept/:id', applicationController.acceptInterview);
router.get('/interview/decline-form/:id', applicationController.getDeclineForm);
router.post('/interview/decline/:id', applicationController.declineInterview);

// ======================================================
// NOTES (GHI CHÚ HỒ SƠ)
// ======================================================
router.get("/notes/:application_id", verifyToken, authorizeRole(["employer"]), applicationController.getNotes);
router.post("/notes", verifyToken, authorizeRole(["employer"]), applicationController.addNote);
router.delete("/notes/:note_id", verifyToken, authorizeRole(["employer"]), applicationController.deleteNote);

// ======================================================
// JOB STATUS (ẨN/HIỆN TIN TUYỂN DỤNG)
// ======================================================
router.put("/jobs/toggle-status", verifyToken, authorizeRole(["employer"]), applicationController.toggleJobStatus);

module.exports = router;