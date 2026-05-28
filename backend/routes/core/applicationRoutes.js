const express = require("express");
const router = express.Router();

const applicationController = require("../../controllers/core/applicationController");

const {
  verifyToken,
  authorizeRole,
} = require("../../middlewares/authMiddleware");


// ======================================================
// CANDIDATE
// ======================================================

// Apply Job
router.post(
  "/apply",
  verifyToken,
  authorizeRole(["candidate"]),
  applicationController.applyJob
);

// My Applications
router.get(
  "/my",
  verifyToken,
  authorizeRole(["candidate"]),
  applicationController.getMyApplications
);

// Withdraw Application
router.delete(
  "/withdraw/:id",
  verifyToken,
  authorizeRole(["candidate"]),
  applicationController.withdrawApplication
);


// ======================================================
// EMPLOYER
// ======================================================

// Employer Applications List
router.get(
  "/employer/list",
  verifyToken,
  authorizeRole(["employer"]),
  applicationController.getEmployerApplications
);

// Employer Application Detail
router.get(
  "/employer/detail/:id",
  verifyToken,
  authorizeRole(["employer"]),
  applicationController.getApplicationById
);

// Update Status
router.put(
  "/update-status",
  verifyToken,
  authorizeRole(["employer"]),
  applicationController.updateApplicationStatus
);

// Employer Jobs Dashboard
router.get(
  "/employer/jobs",
  verifyToken,
  authorizeRole(["employer"]),
  applicationController.getEmployerJobs
);


// ======================================================
// NOTES
// ======================================================

router.get(
  "/notes/:application_id",
  verifyToken,
  authorizeRole(["employer"]),
  applicationController.getNotes
);

router.post(
  "/notes",
  verifyToken,
  authorizeRole(["employer"]),
  applicationController.addNote
);

router.delete(
  "/notes/:note_id",
  verifyToken,
  authorizeRole(["employer"]),
  applicationController.deleteNote
);


// ======================================================
// JOB STATUS
// ======================================================

router.put(
  "/jobs/toggle-status",
  verifyToken,
  authorizeRole(["employer"]),
  applicationController.toggleJobStatus
);

router.delete(
  "/withdraw/:id",
  verifyToken,
  authorizeRole(["candidate"]),
  applicationController.withdrawApplication
);

module.exports = router;