const db = require("../../config/db"); // Giữ lại MySQL cho Jobs và Job_Invitations
const socketModule = require("../../utils/socket"); // Import module socket
const Notification = require("../../models/Notification"); // Model MongoDB gỡ lỗi 2 nấc

exports.getEmployerJobs = async (req, res) => {
  try {
    const employerId = req.user.id;
    const [jobs] = await db.execute(
      `SELECT id, title FROM Jobs 
             WHERE posted_by = ? AND status IN ('pending', 'approved')
             ORDER BY created_at DESC`,
      [employerId],
    );
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error("Error retrieving to-do list:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error retrieving job list.",
      });
  }
};

exports.sendInvitation = async (req, res) => {
  try {
    const { candidateId, jobId, message } = req.body;
    const employerId = req.user.id;

    // Log kiểm tra dữ liệu đầu vào
    console.log("📥 [Request to send invitations] Data received:", {
      employerId,
      candidateId,
      jobId,
      message,
    });

    if (!candidateId || !jobId || !message) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all required information.",
        });
    }

    // 💡 ĐÃ LOẠI BỎ CHẶN TRÙNG LẶP: Cho phép nhà tuyển dụng gửi nhiều lần tùy ý

    // 1. Lưu lời mời vào Cơ sở dữ liệu MySQL
    const [inviteResult] = await db.execute(
      `INSERT INTO Job_Invitations (employer_id, candidate_id, job_id, message, status) VALUES (?, ?, ?, ?, 'pending')`,
      [employerId, candidateId, jobId, message],
    );

    const inviteId = inviteResult.insertId;

    // 2. Tạo thông báo cho Ứng viên bằng MONGODB
    try {
      const title = "You have a new job invitation!";
      const notifMessage =
        "An employer has invited you to apply for a position.";
      const link_url = `/invite-detail/${inviteId}`;

      const newNotif = await Notification.create({
        user_id: candidateId,
        title: title,
        message: notifMessage,
        is_read: false,
        type: "invitation", 
        link_url: link_url,
      });

      // 3. Gửi thông báo thời gian thực (Real-time) sử dụng hàm có sẵn trong socket.js của bạn
      // Sử dụng hàm mượn cổng kết nối HTTP 'emitToUser' đã được định nghĩa trong file socket
      socketModule.emitToUser(candidateId, "receive_notification", {
        _id: newNotif._id, 
        user_id: newNotif.user_id,
        title: newNotif.title,
        message: newNotif.message,
        link_url: newNotif.link_url,
        is_read: newNotif.is_read,
        type: newNotif.type,
        created_at: newNotif.created_at,
      });

      console.log(`🔥 [Socket + MongoDB] EmitToUser sending has been enabled user_${candidateId}`);

    } catch (notifError) {
      // Catch riêng để tránh crash luồng chính nếu Mongo hoặc Socket trục trặc
      console.error("⚠️ Error in creating/sending real-time notifications.:", notifError.message);
    }

    // Phản hồi thành công về cho Front-end
    res
      .status(201)
      .json({ success: true, message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("❌ Critical error in the system:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidateInvitations = async (req, res) => {
  try {
    const candidateId = req.user.id;

    const [invitations] = await db.execute(
      `SELECT 
                ji.id, 
                ji.message, 
                ji.status, 
                ji.created_at,
                j.title AS job_title,
                j.id AS job_id,
                COALESCE(ep.full_name, u.username) AS employer_name,
                c.name AS company_name,
                c.logo_url AS company_logo
             FROM Job_Invitations ji
             JOIN Jobs j ON ji.job_id = j.id
             JOIN Users u ON ji.employer_id = u.id
             LEFT JOIN Profiles ep ON ep.user_id = u.id
             LEFT JOIN Companies c ON u.company_id = c.id
             WHERE ji.candidate_id = ?
             ORDER BY ji.created_at DESC`,
      [candidateId],
    );

    res.status(200).json({ success: true, data: invitations });
  } catch (error) {
    console.error("Error retrieving candidate's invitations:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error retrieving invitation list.",
      });
  }
};

exports.getInvitationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id;

    const [invitations] = await db.execute(
      `SELECT 
                ji.id, 
                ji.message, 
                ji.status, 
                ji.created_at,
                j.title AS job_title,
                j.id AS job_id,
                COALESCE(ep.full_name, u.username) AS employer_name,
                c.name AS company_name,
                c.logo_url AS company_logo
             FROM Job_Invitations ji
             JOIN Jobs j ON ji.job_id = j.id
             JOIN Users u ON ji.employer_id = u.id
             LEFT JOIN Profiles ep ON ep.user_id = u.id
             LEFT JOIN Companies c ON u.company_id = c.id
             WHERE ji.id = ? AND ji.candidate_id = ?`,
      [id, candidateId],
    );

    if (invitations.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Invitation not found or you don't have permission to view it.",
        });
    }

    res.status(200).json({ success: true, data: invitations[0] });
  } catch (error) {
    console.error("Error retrieving invitation details:", error);
    res.status(500).json({ success: false, message: "System error." });
  }
};

exports.updateInvitationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const candidateId = req.user.id;

    if (!["accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }

    const [result] = await db.execute(
      `UPDATE Job_Invitations SET status = ? WHERE id = ? AND candidate_id = ?`,
      [status, id, candidateId],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Invitation not found or invalid action.",
        });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Invitation status updated successfully!",
      });
  } catch (error) {
    console.error("Error updating invitation status:", error);
    res.status(500).json({ success: false, message: "System error." });
  }
};