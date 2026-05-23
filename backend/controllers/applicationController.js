const db = require("../config/db");
const Notification = require("../models/Notification"); // ✅ ĐA MANG LÊN ĐẦU FILE ĐỂ DÙNG CHUNG

// ======================================================
// APPLY JOB (BẢN ĐÃ CHỮA LỖI KIỂU DỮ LIỆU MONGODB)
// ======================================================
exports.applyJob = async (req, res) => {
  const { job_id, cover_letter } = req.body; 
  const candidate_id = req.user.id; // Lấy ID của ứng viên đăng nhập

  try {
    console.log("🚀 [Backend] Nhận yêu cầu ứng tuyển công việc ID:", job_id);

    // 1. CHỮA LỖI: Truy vấn MySQL để lấy thông tin Job (bao gồm tiêu đề và ID người đăng)
    const [jobs] = await db.execute(
      "SELECT id, title, posted_by FROM Jobs WHERE id = ? AND deleted_at IS NULL",
      [job_id]
    );

    // Kiểm tra nếu không tìm thấy công việc trong Database
    if (jobs.length === 0) {
      console.log(`❌ Thất bại: Không tìm thấy Job ID ${job_id} trong MySQL`);
      return res.status(404).json({ success: false, message: "Không tìm thấy công việc này hoặc tin tuyển dụng đã bị xóa!" });
    }

    const job = jobs[0]; // Định nghĩa biến job hợp lệ từ kết quả truy vấn

    // 2. BỔ SUNG: Kiểm tra xem ứng viên đã nộp đơn vào công việc này chưa (Tránh nộp trùng)
    const [existingApp] = await db.execute(
      "SELECT id FROM Applications WHERE job_id = ? AND candidate_id = ?",
      [job_id, candidate_id]
    );

    if (existingApp.length > 0) {
      console.log("⚠️ Cảnh báo: Ứng viên này đã nộp đơn trùng lặp trước đó.");
      return res.status(400).json({ success: false, message: "Bạn đã nộp đơn ứng tuyển cho công việc này rồi!" });
    }

    // 3. THỰC HIỆN: Lưu bản ghi ứng tuyển vào bảng Applications (MySQL)
    await db.execute(
      "INSERT INTO Applications (job_id, candidate_id, cover_letter, status, applied_at) VALUES (?, ?, ?, 'pending', NOW())",
      [job_id, candidate_id, cover_letter || null]
    );
    console.log("⚙️ [MySQL] Đã lưu thành công đơn ứng tuyển mới!");

    // 4. TIẾN HÀNH BẮN THÔNG BÁO SANG MONGODB (BỌC CÔ LẬP ĐỂ TRÁNH SẬP LUỒNG)
    try {
      console.log("⏳ [MongoDB] Đang chuẩn bị bắn thông báo cho Employer ID gốc:", job.posted_by);

      // SỬA TẠI ĐÂY: Ép kiểu thành String thay vì Number để đồng bộ với MongoDB Schema
      const targetEmployerId = String(job.posted_by);
      
      const newNotify = await Notification.create({
        user_id: targetEmployerId, 
        title: "Đơn ứng tuyển mới 📄",
        message: `Ứng viên ${candidateName} đã nộp đơn vào vị trí "${job.title}"`,
        is_read: false,
        type: "apply",
        link_url: "/employer/dashboard", 
        created_at: new Date()
      });

      console.log("🍃 [MongoDB] Đã lưu thành công thông báo mới! Bản ghi:", newNotify);
    } catch (mongoError) {
      console.error("❌ LỖI RIÊNG TẠI LUỒNG MONGODB (MySQL vẫn chạy ổn):");
      console.error(mongoError.message);
    }

    // Luôn trả về thành công vì MySQL đã xử lý xong hồ sơ ứng tuyển
    return res.status(201).json({ success: true, message: "Ứng tuyển thành công và đang cập nhật thông báo!" });

  } catch (error) {
    console.error("====== LỖI SẬP LUỒNG ỨNG TUYỂN CHÍNH ======");
    console.error(error);
    console.error("===============================================");
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
        .json({ success: false, message: "Không tìm thấy đơn ứng tuyển" });
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
      data: {
        ...rows[0],
        work_experience: workExp,
        education: education,
        skills: skills.map((s) => s.name),
      },
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
      .json({ success: false, message: "Status không hợp lệ" });
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
        .json({ success: false, message: "Không tìm thấy đơn ứng tuyển này!" });
    }

    await db.execute("UPDATE Applications SET status = ? WHERE id = ?", [
      status,
      application_id,
    ]);

    // SỬA TẠI ĐÂY: Ép kiểu candidateId về dạng String cho đồng bộ MongoDB
    const candidateId = String(applications[0].candidate_id);
    const jobTitle = applications[0].job_title;

    let notifyTitle = "";
    let notifyMessage = "";

    if (status === "reviewed") {
      notifyTitle = "Hồ sơ đang được xem xét";
      notifyMessage = `Hồ sơ ứng tuyển vị trí "${jobTitle}" của bạn đã được chuyển sang trạng thái: Xem xét (Under Review).`;
    } else if (status === "interviewing") {
      notifyTitle = "Lời mời phỏng vấn";
      notifyMessage = `Chúc mừng! Bạn có lịch phỏng vấn cho vị trí "${jobTitle}".`;
    } else if (status === "accepted") {
      notifyTitle = "Hồ sơ được chấp nhận 🎉";
      notifyMessage = `Chúc mừng bạn đã trúng tuyển vị trí "${jobTitle}"!`;
    } else if (status === "rejected") {
      notifyTitle = "Cập nhật trạng thái hồ sơ";
      notifyMessage = `Cảm ơn bạn đã ứng tuyển vị trí "${jobTitle}". Hồ sơ của bạn chưa phù hợp lần này.`;
    }

    if (notifyTitle && notifyMessage) {
      await Notification.create({
        user_id: candidateId, // Sử dụng chuỗi string an toàn
        title: notifyTitle,
        message: notifyMessage,
        is_read: false,
        type: "system",
        link_url: "/profile/applications",
        created_at: new Date() // Đảm bảo thêm mốc thời gian
      });
      console.log(
        "🍃 [MongoDB] Đã bắn thành công 1 thông báo xét duyệt cho Candidate ID:",
        candidateId,
      );
    }

    res.status(200).json({
      success: true,
      message: `Đã chuyển trạng thái sang: ${status} và tạo thông báo!`,
    });
  } catch (error) {
    console.error("🚨 Lỗi update status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET EMPLOYER JOBS
// ======================================================
exports.getEmployerJobs = async (req, res) => {
  const employer_id = req.user.id;

  try {
    const [jobs] = await db.execute(
      `
            SELECT 
                j.id, j.title, j.job_type, j.status, j.created_at,
                l.name AS location_name,
                COUNT(a.id) AS application_count
            FROM Jobs j
            LEFT JOIN Locations l ON j.location_id = l.id
            LEFT JOIN Applications a ON j.id = a.job_id
            WHERE j.posted_by = ? AND j.deleted_at IS NULL
            GROUP BY j.id
            ORDER BY j.created_at DESC
        `,
      [employer_id],
    );

    const [stats] = await db.execute(
      `
            SELECT
                COUNT(DISTINCT j.id) AS total_jobs,
                COUNT(a.id) AS total_applications
            FROM Jobs j
            LEFT JOIN Applications a ON j.id = a.job_id
            WHERE j.posted_by = ?
        `,
      [employer_id],
    );

    res.status(200).json({ success: true, data: jobs, stats: stats[0] });
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
    console.error("Lỗi SQL:", error.message);
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
        .json({ success: false, message: "Không tìm thấy đơn ứng tuyển" });
    }

    if (applications[0].status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Chỉ có thể rút hồ sơ đang pending" });
    }

    await db.execute(`DELETE FROM Applications WHERE id = ?`, [application_id]);
    res.json({ success: true, message: "Đã rút hồ sơ ứng tuyển" });
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
    console.error("Lỗi getNotes:", error);
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
      .json({ success: false, message: "Nội dung ghi chú không được trống" });
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
    console.error("Lỗi addNote:", error);
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
        .json({ success: false, message: "Không có quyền xóa ghi chú này" });
    }

    res.status(200).json({ success: true, message: "Đã xóa ghi chú" });
  } catch (error) {
    console.error("Lỗi deleteNote:", error);
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
        .json({ success: false, message: "Không tìm thấy tin tuyển dụng" });
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
          ? "Đã đóng tin tuyển dụng"
          : "Đã mở lại tin tuyển dụng",
      new_status: newStatus,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};