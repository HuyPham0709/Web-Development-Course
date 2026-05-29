const db = require("../../config/db");
const Notification = require("../../models/Notification"); 
const socketUtils = require("../../utils/socket");
const { sendMail } = require('../../config/mailer');

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

// ======================================================
// INVITE INTERVIEW (EMPLOYER SENDS INTERVIEW INVITATION)
// ======================================================
exports.inviteInterview = async (req, res, next) => {
  try {
    const { application_id, location, time, message } = req.body;

    // 1. Get application profile details from MySQL DB system
    const [rows] = await db.execute(`
      SELECT 
        a.candidate_id AS candidate_user_id,
        u.email AS candidate_email,
        COALESCE(p.full_name, u.username) AS candidate_name,
        j.title AS job_title,
        c.name AS company_name
      FROM Applications a
      JOIN Users u ON a.candidate_id = u.id
      LEFT JOIN Profiles p ON u.id = p.user_id
      JOIN Jobs j ON a.job_id = j.id
      LEFT JOIN Companies c ON j.company_id = c.id
      WHERE a.id = ?
    `, [application_id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application profile information not found!' });
    }

    const application = rows[0];

    // 2. Execute UPDATE application status to 'reviewed' (Under Review) in MySQL
    await db.execute("UPDATE Applications SET status = 'reviewed' WHERE id = ?", [application_id]);

    // 3. Send interview invitation mail via SMTP
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    await sendMail({
      to: application.candidate_email,
      subject: `[${application.company_name}] Interview Invitation for ${application.job_title} position`,
      html: `
        <h3>Dear ${application.candidate_name},</h3>
        <p>We are pleased to invite you for an interview with <strong>${application.company_name}</strong>:</p>
        <ul>
          <li><strong>Job Position:</strong> ${application.job_title}</li>
          <li><strong>Time:</strong> ${new Date(time).toLocaleString('en-US')}</li>
          <li><strong>Location:</strong> ${location}</li>
        </ul>
        ${message ? `<p><strong>Message from Employer:</strong> ${message}</p>` : ''}
        <br/>
        <p>Please confirm your availability by choosing an option below:</p>
        <div style="margin-top: 20px;">
          <a href="${baseUrl}/api/applications/interview/accept/${application_id}" style="background:#10b981;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin-right:15px;display:inline-block;">Accept Invitation</a>
          <a href="${baseUrl}/api/applications/interview/decline-form/${application_id}" style="background:#ef4444;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Decline Invitation</a>
        </div>
      `
    });

    // 4. Save notification to MongoDB to store notification bell history
    const targetCandidateId = String(application.candidate_user_id);
    const newNotify = await Notification.create({
      user_id: targetCandidateId,
      title: "New interview appointment 📅",
      message: `Company ${application.company_name} has sent an interview schedule for the position ${application.job_title}.`,
      is_read: false,
      type: "system",
      link_url: "/profile/applications",
      created_at: new Date()
    });

    // 5. ⚡ Realtime: Instantly synchronize status to 'reviewed' on Candidate's screen if they are online
    socketUtils.emitToUser(targetCandidateId, 'applicationStatusChanged', {
      application_id: Number(application_id),
      newStatus: 'reviewed'
    });

    // 6. 🔔 Realtime: Dispatch notification to Candidate's system notification bell
    socketUtils.sendNotification(targetCandidateId, newNotify);

    return res.status(200).json({ success: true, message: 'Invitation sent and status updated successfully!' });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// INTERVIEW ACCEPT (CANDIDATE CLICKS "ACCEPT" FROM EMAIL)
// ======================================================
exports.acceptInterview = async (req, res, next) => {
  try {
    const { id } = req.params; // id is the application_id from the Email Link sent out

    // 1. Query application details to find which Employer is in charge of the post
    const [rows] = await db.execute(`
      SELECT 
        j.posted_by AS employer_user_id,
        COALESCE(p.full_name, u.username) AS candidate_name,
        j.title AS job_title
      FROM Applications a
      JOIN Users u ON a.candidate_id = u.id
      LEFT JOIN Profiles p ON u.id = p.user_id
      JOIN Jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.send('<h3 style="color:red;text-align:center;margin-top:50px;">Error: Invalid link or application profile does not exist!</h3>');
    }

    const application = rows[0];

    // 2. Execute UPDATE application status to 'interviewing' in MySQL DB
    await db.execute("UPDATE Applications SET status = 'interviewing' WHERE id = ?", [id]);

    // 3. Save notification to MongoDB for Employer to review later
    const targetEmployerId = String(application.employer_user_id);
    const newNotify = await Notification.create({
      user_id: targetEmployerId,
      title: "Candidate accepted interview 🎉",
      message: `Candidate ${application.candidate_name} has agreed to attend the interview for position ${application.job_title}.`,
      is_read: false,
      type: "system",
      link_url: "/employer/candidates",
      created_at: new Date()
    });

    // 4. ⚡ Realtime: Automatically move the candidate card to the "Interviewing" column on Employer's Kanban board without reloading
    socketUtils.emitToUser(targetEmployerId, 'applicationStatusChanged', {
      application_id: Number(id),
      newStatus: 'interviewing'
    });

    // 5. 🔔 Realtime: Dispatch notification bell directly to Employer
    socketUtils.sendNotification(targetEmployerId, newNotify);

    return res.send(`
      <div style="text-align:center; margin-top:50px; font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color:#10b981;">Attendance Confirmed Successfully!</h2>
        <p style="color:#4b5563; font-size:16px;">The system has automatically sent your feedback notification to the Employer.</p>
      </div>
    `);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// INTERVIEW DECLINE (CANDIDATE CONFIRMS "DECLINE" VIA FORM)
// ======================================================
exports.declineInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // 1. Get application details from MySQL DB
    const [rows] = await db.execute(`
      SELECT 
        j.posted_by AS employer_user_id,
        COALESCE(p.full_name, u.username) AS candidate_name,
        j.title AS job_title
      FROM Applications a
      JOIN Users u ON a.candidate_id = u.id
      LEFT JOIN Profiles p ON u.id = p.user_id
      JOIN Jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.send('<h3 style="color:red;text-align:center;margin-top:50px;">Error: Matching application profile not found!</h3>');
    }

    const application = rows[0];

    // 2. Execute UPDATE application status to 'rejected' in the DB
    await db.execute("UPDATE Applications SET status = 'rejected' WHERE id = ?", [id]);

    // 3. Save notification to MongoDB for Employer with specific decline reason
    const targetEmployerId = String(application.employer_user_id);
    const textReason = reason ? reason.trim() : "No specific reason provided";

    const newNotify = await Notification.create({
      user_id: targetEmployerId,
      title: "Candidate declined interview ❌",
      message: `Candidate ${application.candidate_name} has declined the interview for position ${application.job_title}. Reason: ${textReason}`,
      is_read: false,
      type: "system",
      link_url: "/employer/candidates",
      created_at: new Date()
    });

    // 4. ⚡ Realtime: Instantly push candidate card to the Rejected column on Employer's Kanban screen
    socketUtils.emitToUser(targetEmployerId, 'applicationStatusChanged', {
      application_id: Number(id),
      newStatus: 'rejected'
    });

    // 5. 🔔 Realtime: Direct system notification bell with reason to Employer
    socketUtils.sendNotification(targetEmployerId, newNotify);

    return res.send(`
      <div style="text-align:center; margin-top:50px; font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color:#ef4444;">Interview cancellation confirmed!</h2>
        <p style="color:#4b5563; font-size:16px;">We have recorded your response and forwarded your decline reason to the Employer.</p>
      </div>
    `);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET DECLINE FORM 
// ======================================================
exports.getDeclineForm = (req, res) => {
  const { id } = req.params; // id is application_id from email link
  
  // Return a clean HTML interface for candidate to fill in the reason directly from browser
  res.send(`
    <div style="max-width: 500px; margin: 50px auto; font-family: Arial, sans-serif; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <h2 style="color: #ef4444; margin-top: 0; margin-bottom: 10px;">Decline Interview Invitation</h2>
      <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
        You are declining this interview invitation. Please provide a brief reason so we can forward it to the Employer.
      </p>
      
      <form action="/api/applications/interview/decline/${id}" method="POST">
        <label style="display: block; font-weight: bold; margin-bottom: 8px; font-size: 14px; color: #374151;">
          Reason for declining <span style="color:red;">*</span>
        </label>
        <textarea 
          name="reason" 
          rows="4" 
          required 
          style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; resize: none; margin-bottom: 20px; font-size: 14px;" 
          placeholder="Example: I have accepted another offer / Schedule conflict / Cannot arrange time..."></textarea>
          
        <button 
          type="submit" 
          style="background: #ef4444; color: white; border: none; padding: 12px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; font-size: 15px; transition: background 0.2s;">
          Confirm Decline
        </button>
      </form>
    </div>
  `);
};