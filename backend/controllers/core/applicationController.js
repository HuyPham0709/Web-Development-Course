const db = require("../../config/db");
const Notification = require("../../models/Notification");
const socketUtils = require("../../utils/socket");
const { sendMail } = require('../../config/mailer');

// ======================================================
// APPLY JOB
// ======================================================
exports.applyJob = async (req, res) => {
  const { job_id, cover_letter } = req.body;
  const candidate_id = req.user.id;

  try {
    console.log("🚀 [Backend] Received application request for Job ID:", job_id);

    const [jobs] = await db.execute(
      "SELECT id, title, posted_by FROM Jobs WHERE id = ? AND deleted_at IS NULL",
      [job_id],
    );

    if (jobs.length === 0) {
      console.log(`❌ Failure: Job ID ${job_id} not found in MySQL`);
      return res
        .status(404)
        .json({
          success: false,
          message: "This job post could not be found or has been deleted!",
        });
    }

    const job = jobs[0];

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

    await db.execute(
      "INSERT INTO Applications (job_id, candidate_id, cover_letter, status, applied_at) VALUES (?, ?, ?, 'pending', NOW())",
      [job_id, candidate_id, cover_letter || null],
    );
    console.log("⚙️ [MySQL] Successfully saved new job application record!");

    try {
      console.log(
        "⏳ [MongoDB] Preparing to send notification to native Employer ID:",
        job.posted_by,
      );

      const targetEmployerId = String(job.posted_by);
      const candidateName = req.user.full_name || req.user.name || req.user.username || "Anonymous Candidate";

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
      socketUtils.sendNotification(targetEmployerId, newNotify);

    } catch (mongoError) {
      console.error("❌ ERROR WITHIN MONGODB/SOCKET THREAD (MySQL remains unaffected):");
      console.error(mongoError.message);
    }

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
    if (currentStatus === "banned") {
      return res.status(403).json({
        success: false,
        message: "This job has been banned by admin and cannot be reopened."
      });
    }

    const newStatus = currentStatus === "closed" ? "approved" : "closed";

    await db.execute("UPDATE Jobs SET status = ? WHERE id = ?", [newStatus, job_id]);

    res.status(200).json({
      success: true,
      message: newStatus === "closed" ? "Job post has been closed" : "Job post has been reopened",
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

    await db.execute("UPDATE Applications SET status = 'reviewed' WHERE id = ?", [application_id]);

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    // NÂNG CẤP GIAO DIỆN EMAIL THEO THIẾT KẾ PREMIUM GRADIENT
    const htmlEmailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interview Invitation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased; width: 100% !important;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;">
              
              <tr>
                <td height="6" style="background: linear-gradient(to right, #0052FF, #8B5CF6); line-height: 6px; font-size: 6px;">&nbsp;</td>
              </tr>

              <tr>
                <td style="padding: 36px 40px 24px 40px;">
                  <span style="font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">
                    JobSpot<span style="color: #0052FF;">Network</span>
                  </span>
                </td>
              </tr>

              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  <h1 style="margin: 0 0 18px 0; font-size: 24px; font-weight: 700; color: #0F172A; line-height: 1.3;">
                    Interview Invitation
                  </h1>
                  
                  <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.5;">
                    Dear <strong style="color: #0F172A;">${application.candidate_name}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                    We are pleased to invite you for an interview with <strong style="color: #0F172A;">${application.company_name}</strong>. Your application profile completely aligns with our recruitment demands.
                  </p>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F5F9; border-radius: 16px; margin-bottom: 28px; border-left: 4px solid #0052FF;">
                    <tr>
                      <td style="padding: 24px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="8" border="0">
                          <tr>
                            <td width="30%" valign="top" style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 0;">Job Position</td>
                            <td width="70%" valign="top" style="font-size: 15px; font-weight: 700; color: #0F172A; padding-right: 0;">${application.job_title}</td>
                          </tr>
                          <tr>
                            <td valign="top" style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 0;">Time</td>
                            <td valign="top" style="font-size: 15px; font-weight: 600; color: #0052FF; padding-right: 0;">${new Date(time).toLocaleString('en-US')}</td>
                          </tr>
                          <tr>
                            <td valign="top" style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 0;">Location</td>
                            <td valign="top" style="font-size: 15px; color: #334155; line-height: 1.4; padding-right: 0;">${location}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  ${message ? `
                  <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 14px; padding: 18px; margin-bottom: 36px;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Message from Employer:</p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155; font-style: italic;">
                      "${message}"
                    </p>
                  </div>
                  ` : ''}

                  <p style="margin: 0 0 24px 0; font-size: 14px; font-weight: 600; color: #475569; text-align: center;">
                    Please confirm your availability by choosing an option below:
                  </p>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="border-radius: 12px; background-color: #0052FF;" bgcolor="#0052FF">
                              <a href="${baseUrl}/api/applications/interview/accept/${application_id}" target="_blank" style="border: 1px solid #0052FF; border-radius: 12px; color: #ffffff; display: inline-block; font-size: 14px; font-weight: 700; padding: 14px 28px; text-decoration: none;">
                                Accept Invitation
                              </a>
                            </td>
                            <td width="16">&nbsp;</td>
                            <td style="border-radius: 12px; background-color: #F1F5F9; border: 1px solid #E2E8F0;" bgcolor="#F1F5F9">
                              <a href="${baseUrl}/api/applications/interview/decline-form/${application_id}" target="_blank" style="color: #64748B; display: inline-block; font-size: 14px; font-weight: 600; padding: 14px 28px; text-decoration: none;">
                                Decline
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
              
              <tr>
                <td style="padding: 24px 40px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                    This is an automated notification from JobSpot Network.<br>© 2026 JobSpot Network. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await sendMail({
      to: application.candidate_email,
      subject: `[${application.company_name}] Interview Invitation for ${application.job_title} position`,
      html: htmlEmailContent
    });

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

    socketUtils.emitToUser(targetCandidateId, 'applicationStatusChanged', {
      application_id: Number(application_id),
      newStatus: 'reviewed'
    });

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
    const { id } = req.params;

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
      return res.send(`
        <div style="max-width: 500px; margin: 80px auto; font-family: -apple-system, sans-serif; padding: 40px; text-align: center; border: 1px solid #fee2e2; background-color: #fef2f2; border-radius: 20px; box-shadow: 0 4px 12px rgba(239,68,68,0.05);">
          <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
          <h3 style="color:#dc2626; margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">Link Expired or Invalid!</h3>
          <p style="color:#7f1d1d; font-size:14px; line-height: 1.5; margin: 0;">Matching application profile information does not exist in our network.</p>
        </div>
      `);
    }

    const application = rows[0];

    await db.execute("UPDATE Applications SET status = 'interviewing' WHERE id = ?", [id]);

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

    socketUtils.emitToUser(targetEmployerId, 'applicationStatusChanged', {
      application_id: Number(id),
      newStatus: 'interviewing'
    });

    socketUtils.sendNotification(targetEmployerId, newNotify);

    // MÀN HÌNH XÁC NHẬN THÀNH CÔNG ĐỒNG BỘ TONE MÀU GRADIENT VÀ THIẾT KẾ BO GÓC CAO CẤP
    return res.send(`
      <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #F8FAFC; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 480px; width: 100%; margin: 20px; background-color: #ffffff; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); border: 1px solid #E2E8F0; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(to right, #0052FF, #8B5CF6);"></div>
          <div style="width: 72px; height: 72px; background: #ECFDF5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style="color: #0F172A; margin: 0 0 12px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Attendance Confirmed!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">The system has automatically updated your status to <span style="color: #0052FF; font-weight: 600;">Interviewing</span> and dispatched immediate feedback to the Employer.</p>
          <div style="border-top: 1px solid #F1F5F9; padding-top: 20px;">
            <span style="font-size: 13px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px;">JobSpot<span style="color: #0052FF;">Network</span></span>
          </div>
        </div>
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
      return res.send(`
        <div style="max-width: 500px; margin: 80px auto; font-family: -apple-system, sans-serif; padding: 40px; text-align: center; border: 1px solid #fee2e2; background-color: #fef2f2; border-radius: 20px; box-shadow: 0 4px 12px rgba(239,68,68,0.05);">
          <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
          <h3 style="color:#dc2626; margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">Profile Not Found!</h3>
          <p style="color:#7f1d1d; font-size:14px; margin: 0;">Matching application profile metadata cannot be extracted from our core DB.</p>
        </div>
      `);
    }

    const application = rows[0];

    await db.execute("UPDATE Applications SET status = 'rejected' WHERE id = ?", [id]);

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

    socketUtils.emitToUser(targetEmployerId, 'applicationStatusChanged', {
      application_id: Number(id),
      newStatus: 'rejected'
    });

    socketUtils.sendNotification(targetEmployerId, newNotify);

    // MÀN HÌNH THÔNG BÁO HỦY LỊCH THÀNH CÔNG UI SẠCH SẼ, CAO CẤP
    return res.send(`
      <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #F8FAFC; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 480px; width: 100%; margin: 20px; background-color: #ffffff; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); border: 1px solid #E2E8F0; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: #EF4444;"></div>
          <div style="width: 72px; height: 72px; background: #FEF2F2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <h2 style="color: #0F172A; margin: 0 0 12px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Decline Confirmed</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">We have successfully recorded your cancellation response and forwarded the rationale reasons directly to the Employer.</p>
          <div style="border-top: 1px solid #F1F5F9; padding-top: 20px;">
            <span style="font-size: 13px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px;">JobSpot<span style="color: #0052FF;">Network</span></span>
          </div>
        </div>
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
  const { id } = req.params;

  // NÂNG CẤP GIAO DIỆN FORM ĐIỀN LÝ DO TỪ CHỐI CHUẨN PREMIUM ĐỒNG BỘ AUTH.TSX
  res.send(`
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #F8FAFC; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 500px; width: 100%; margin: 20px; background-color: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); border: 1px solid #E2E8F0; position: relative; overflow: hidden;">
        
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(to right, #0052FF, #8B5CF6);"></div>
        
        <h2 style="color: #0F172A; margin: 0 0 10px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Decline Interview Invitation</h2>
        <p style="color: #64748B; font-size: 14px; margin-bottom: 28px; line-height: 1.6;">
          You are about to decline this interview opportunity. Please provide a brief reason below so we can accurately update the employer.
        </p>
        
        <form action="/api/applications/interview/decline/${id}" method="POST">
          <label style="display: block; font-weight: 700; margin-bottom: 8px; font-size: 13px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
            Reason for declining <span style="color: #EF4444;">*</span>
          </label>
          <textarea 
            name="reason" 
            rows="4" 
            required 
            style="width: 100%; padding: 14px; border: 1px solid #CBD5E1; border-radius: 16px; box-sizing: border-box; resize: none; margin-bottom: 24px; font-size: 14px; font-family: inherit; color: #0F172A; background-color: #F8FAFC; transition: border-color 0.2s;" 
            placeholder="e.g., I have accepted another offer / Schedule conflict / Family emergency..."></textarea>
            
          <button 
            type="submit" 
            style="background: #EF4444; color: white; border: none; padding: 14px 20px; border-radius: 16px; font-weight: 700; cursor: pointer; width: 100%; font-size: 15px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15); transition: background 0.2s;">
            Confirm Decline
          </button>
        </form>

        <div style="border-top: 1px solid #F1F5F9; padding-top: 20px; margin-top: 24px; text-align: center;">
          <span style="font-size: 12px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px;">JobSpot<span style="color: #0052FF;">Network</span></span>
        </div>
      </div>
    </div>
  `);
};