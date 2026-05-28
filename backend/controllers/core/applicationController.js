const db = require("../../config/db");
const Notification = require("../../models/Notification"); 
const socketUtils = require("../../utils/socket");

// ======================================================
// APPLY JOB
// ======================================================
exports.applyJob = async (req, res) => {
  const { job_id, cover_letter } = req.body;
  const candidate_id = req.user.id; // Get logged-in candidate's ID

  try {
    console.log("🚀 [Backend] Received application request for Job ID:", job_id);

    // 1. Query MySQL to get Job details (including title and publisher's ID)
    const [jobs] = await db.execute(
      "SELECT id, title, posted_by FROM Jobs WHERE id = ? AND deleted_at IS NULL",
      [job_id],
    );

    // Check if the job exists in the database
    if (jobs.length === 0) {
      console.log(`❌ Failure: Job ID ${job_id} not found in MySQL`);
      return res
        .status(404)
        .json({
          success: false,
          message: "This job post could not be found or has been deleted!",
        });
    }

    const job = jobs[0]; // Define a valid job variable from the query results

    // 2. Check if the candidate has already applied for this job (Avoid duplicates)
    const [existingApp] = await db.execute(
      "SELECT id FROM Applications WHERE job_id = ? AND candidate_id = ?",
      [job_id, candidate_id],
    );

    if (existingApp.length > 0) {
      console.log("⚠️ Warning: This candidate has already submitted a duplicate application.");
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already applied for this position!",
        });
    }

    // 3. EXECUTE: Save application record into the Applications table (MySQL)
    await db.execute(
      "INSERT INTO Applications (job_id, candidate_id, cover_letter, status, applied_at) VALUES (?, ?, ?, 'pending', NOW())",
      [job_id, candidate_id, cover_letter || null],
    );
    console.log("⚙️ [MySQL] Successfully saved new job application record!");

    // 4. PROCEED WITH NOTIFICATION DISPATCH TO MONGODB & SOCKET REAL-TIME
    try {
      console.log(
        "⏳ [MongoDB] Preparing to send notification to native Employer ID:",
        job.posted_by,
      );

      const targetEmployerId = String(job.posted_by);

      // Extract the candidate's full name from the authenticated user context
      const candidateName = req.user.full_name || req.user.name || req.user.username || "Anonymous Candidate";

      // Persist the notification structure to MongoDB
      const newNotify = await Notification.create({
        user_id: targetEmployerId,
        title: "New Job Application 📄",
        message: `Candidate ${candidateName} has applied for the position "${job.title}"`,
        is_read: false,
        type: "apply",
        link_url: "/employer/candidates", 
        created_at: new Date(),
      });

      console.log("🍃 [MongoDB] Successfully saved new notification!");

      // 🔥 REAL-TIME: Dispatch immediately via Socket to the Employer
      socketUtils.sendNotification(targetEmployerId, newNotify);

    } catch (mongoError) {
      console.error("❌ ERROR WITHIN MONGODB/SOCKET THREAD (MySQL remains unaffected):");
      console.error(mongoError.message);
    }

    // Always respond with success since the core MySQL profile registration completed
    return res
      .status(201)
      .json({
        success: true,
        message: "Applied successfully and dispatching updates!",
      });
  } catch (error) {
    console.error("====== CRITICAL APPLICATION PROCESS FLOW CRASH ======");
    console.error(error);
    console.error("=====================================================");
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET EMPLOYER APPLICATIONS
// ======================================================
exports.getEmployerApplications = async (req, res) => {
  const employer_id = req.user.id;
  try {
    const [rows] = await db.execute(
      `
            SELECT
                a.id AS application_id,
                u.id AS candidate_id,
                u.username AS candidate_name,
                u.email AS candidate_email,
                p.full_name,
                p.phone,
                p.cv_url,
                p.avatar_url,
                j.title AS job_title,
                j.id AS job_id,
                j.experience_level,
                a.cover_letter,
                a.status,
                a.applied_at
            FROM Applications a
            JOIN Users u ON a.candidate_id = u.id
            LEFT JOIN Profiles p ON u.id = p.user_id
            JOIN Jobs j ON a.job_id = j.id
            WHERE j.posted_by = ?
            ORDER BY a.applied_at DESC
        `,
      [employer_id],
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET APPLICATION BY ID
// ======================================================
exports.getApplicationById = async (req, res) => {
  const { id } = req.params;
  const employer_id = req.user.id;
  try {
    const [rows] = await db.execute(
      `
            SELECT
                a.id AS application_id,
                u.id AS candidate_id,
                u.username AS candidate_name,
                u.email AS candidate_email,
                p.full_name,
                p.phone,
                p.bio,
                p.cv_url,
                p.avatar_url,
                a.cv_snapshot_url,
                j.title AS job_title,
                j.id AS job_id,
                a.cover_letter,
                a.status,
                a.applied_at
            FROM Applications a
            JOIN Users u ON a.candidate_id = u.id
            LEFT JOIN Profiles p ON u.id = p.user_id
            JOIN Jobs j ON a.job_id = j.id
            WHERE a.id = ? AND j.posted_by = ?
        `,
      [id, employer_id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    const [workExp] = await db.execute(
      `SELECT company_name, position, start_date, end_date, description FROM Work_Experience WHERE profile_id = (SELECT id FROM Profiles WHERE user_id = ?) ORDER BY start_date DESC`,
      [rows[0].candidate_id],
    );
    const [education] = await db.execute(
      `SELECT school_name, major, start_date, end_date FROM Education WHERE profile_id = (SELECT id FROM Profiles WHERE user_id = ?) ORDER BY start_date DESC`,
      [rows[0].candidate_id],
    );
    const [skills] = await db.execute(
      `SELECT s.name FROM User_Skills us JOIN Skills s ON us.skill_id = s.id WHERE us.profile_id = (SELECT id FROM Profiles WHERE user_id = ?)`,
      [rows[0].candidate_id],
    );

    res.status(200).json({
      success: true,
      data: { ...rows[0], work_experience: workExp, education, skills: skills.map(s => s.name) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// UPDATE APPLICATION STATUS
// ======================================================
exports.updateApplicationStatus = async (req, res) => {
  const { application_id, status } = req.body;
  const employer_id = req.user.id;

  const allowedStatuses = [
    "pending",
    "reviewed",
    "interviewing",
    "accepted",
    "rejected",
  ];
  if (!allowedStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status provided" });
  }

  try {
    const [applications] = await db.execute(
      `SELECT a.candidate_id, j.title as job_title 
       FROM Applications a 
       JOIN Jobs j ON a.job_id = j.id 
       WHERE a.id = ?`,
      [application_id],
    );
    if (applications.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found!" });
    }

    await db.execute("UPDATE Applications SET status = ? WHERE id = ?", [
      status,
      application_id,
    ]);

    // Format candidateId as String for MongoDB query compliance
    const candidateId = String(applications[0].candidate_id);
    const jobTitle = applications[0].job_title;

    let notifyTitle = "";
    let notifyMessage = "";

    if (status === "reviewed") {
      notifyTitle = "The application is under review.";
      notifyMessage = `The application for the position "${jobTitle}" has been updated to: Under Review.`;
    } else if (status === "interviewing") {
      notifyTitle = "Interview Invitation 📅";
      notifyMessage = `Congratulations! You have an interview scheduled for the position "${jobTitle}". Please prepare well.`;
    } else if (status === "accepted") {
      notifyTitle = "Application accepted 🎉";
      notifyMessage = `The application for the position "${jobTitle}" has been accepted. Congratulations! The employer will contact you soon.`;
    } else if (status === "rejected") {
      notifyTitle = "Application rejected";
      notifyMessage = `The application for the position "${jobTitle}" has been rejected. Thank you for your interest.`;
    }

    if (notifyTitle && notifyMessage) {
      // 1. Persist candidate event notification to MongoDB
      const newCandidateNotify = await Notification.create({
        user_id: candidateId, 
        title: notifyTitle,
        message: notifyMessage,
        is_read: false,
        type: "system",
        link_url: "/profile/applications", 
        created_at: new Date(), 
      });
      console.log("🍃 [MongoDB] Successfully generated a target review evaluation notification.");

      // 🔥 2. REAL-TIME: Dispatch immediate telemetry via active connection socket to Candidate
      socketUtils.sendNotification(candidateId, newCandidateNotify);
    }

    res.status(200).json({
      success: true,
      message: `Status transitioned to: ${status} and candidate notified successfully!`,
    });
  } catch (error) {
    console.error("🚨 Error updating status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET EMPLOYER JOBS
// ======================================================
exports.getEmployerJobs = async (req, res) => {
  const employer_id = req.user.id;
  try {
    const [jobs] = await db.execute(`
      SELECT
        j.id, j.title, j.job_type, j.status, j.created_at,
        j.salary_min, j.salary_max, j.rejection_reason,
        l.name AS location_name,
        COUNT(a.id) AS application_count
      FROM Jobs j
      LEFT JOIN Locations l ON j.location_id = l.id
      LEFT JOIN Applications a ON j.id = a.job_id
      WHERE j.posted_by = ? AND j.deleted_at IS NULL
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `, [employer_id]);

    const total_jobs = jobs.length;
    // Calculate applications metrics solely from approved listings
    const total_applications = jobs.reduce((sum, job) => {
      return job.status === 'approved'
        ? sum + (parseInt(job.application_count) || 0)
        : sum;
    }, 0);

    res.status(200).json({
      success: true,
      data: jobs,
      stats: { total_jobs, total_applications }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// MY APPLICATIONS
// ======================================================
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      `
            SELECT
                a.id AS application_id,
                j.id AS job_id,
                j.title AS job_title,
                c.name AS company_name,
                l.name AS location,
                j.job_type,
                a.status,
                a.applied_at,
                c.logo_url
            FROM applications a
            LEFT JOIN jobs j ON a.job_id = j.id
            LEFT JOIN locations l ON j.location_id = l.id
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE a.candidate_id = ?
            ORDER BY a.applied_at DESC
        `,
      [userId],
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("SQL Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// WITHDRAW APPLICATION
// ======================================================
exports.withdrawApplication = async (req, res) => {
  const candidate_id = req.user.id;
  const application_id = req.params.id;
  try {
    const [applications] = await db.execute(
      `SELECT id, status FROM Applications WHERE id = ? AND candidate_id = ?`,
      [application_id, candidate_id],
    );
    if (applications.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    if (applications[0].status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "You can only withdraw applications that are pending" });
    }
    await db.execute(`DELETE FROM Applications WHERE id = ?`, [application_id]);
    res.json({ success: true, message: "Application withdrawn successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET NOTES
// ======================================================
exports.getNotes = async (req, res) => {
  const application_id = req.params.id || req.params.application_id;

  try {
    const [rows] = await db.execute(
      `
            SELECT n.id, n.content, n.created_at, u.username
            FROM Application_Notes n JOIN Users u ON n.author_id = u.id
            WHERE n.application_id = ? ORDER BY n.created_at ASC
        `,
      [application_id],
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error in getNotes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// ADD NOTE
// ======================================================
exports.addNote = async (req, res) => {
  const { application_id, content } = req.body;
  const author_id = req.user.id;

  if (!content?.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Note content cannot be empty" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO Application_Notes (application_id, author_id, content) VALUES (?, ?, ?)",
      [application_id, author_id, content.trim()],
    );

    const [newNote] = await db.execute(
      `
            SELECT n.id, n.content, n.created_at, u.username
            FROM Application_Notes n JOIN Users u ON n.author_id = u.id WHERE n.id = ?
        `,
      [result.insertId],
    );

    res.status(201).json({ success: true, data: newNote[0] });
  } catch (error) {
    console.error("Error in addNote:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// DELETE NOTE
// ======================================================
exports.deleteNote = async (req, res) => {
  const note_id = req.params.id || req.params.note_id;
  const author_id = req.user.id;

  try {
    const [result] = await db.execute(
      "DELETE FROM Application_Notes WHERE id = ? AND author_id = ?",
      [note_id, author_id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(403)
        .json({ success: false, message: "You do not have permission to delete this note" });
    }

    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNote:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// TOGGLE JOB STATUS
// ======================================================
exports.toggleJobStatus = async (req, res) => {
  const { job_id } = req.body;
  const employer_id = req.user.id;

  try {
    const [jobs] = await db.execute(
      "SELECT id, status FROM Jobs WHERE id = ? AND posted_by = ?",
      [job_id, employer_id],
    );

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Job post not found" });
    }

    const currentStatus = jobs[0].status;
    const newStatus = currentStatus === "closed" ? "approved" : "closed";

    await db.execute("UPDATE Jobs SET status = ? WHERE id = ?", [
      newStatus,
      job_id,
    ]);

    res.status(200).json({
      success: true,
      message:
        newStatus === "closed"
          ? "Job post has been closed"
          : "Job post has been reopened",
      new_status: newStatus,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};