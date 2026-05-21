const db = require("../config/db");

// ======================================================
// APPLY JOB
// ======================================================
exports.applyJob = async (req, res) => {
    // [GIỮ NGUYÊN TỪ CODE CŨ] Sửa dòng này để nhận cả job_id hoặc jobId -> SỬA LỖI KEY
    const job_id = req.body.job_id || req.body.jobId;
    const { cover_letter } = req.body;
    const candidate_id = req.user.id;

    if (!job_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Thiếu job_id! Kiểm tra lại dữ liệu Frontend gửi lên." 
        });
    }

    try {
        // [THÊM TỪ CODE MỚI] CHECK PROFILE & CV
        const [profiles] = await db.execute(
            'SELECT cv_url FROM Profiles WHERE user_id = ?',
            [candidate_id]
        );

        if (profiles.length === 0) {
            return res.status(400).json({ success: false, message: "Vui lòng tạo profile trước" });
        }

        if (!profiles[0].cv_url) {
            return res.status(400).json({ success: false, message: "Vui lòng upload CV trước" });
        }

        const cv_url = profiles[0].cv_url;

        // [THÊM TỪ CODE MỚI] CHECK TRẠNG THÁI JOB
        const [jobs] = await db.execute(
            'SELECT id, status FROM Jobs WHERE id = ?',
            [job_id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy công việc" });
        }

        if (jobs[0].status !== "approved") {
            return res.status(400).json({ success: false, message: "Công việc chưa khả dụng" });
        }

        // [GIỮ NGUYÊN TỪ CODE CŨ] CHECK DUPLICATE
        const [existing] = await db.execute(
            'SELECT * FROM applications WHERE job_id = ? AND candidate_id = ?',
            [job_id, candidate_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Bạn đã ứng tuyển công việc này rồi!" });
        }

        // [THÊM TỪ CODE MỚI] INSERT CÓ THÊM TRƯỜNG cv_snapshot_url
        await db.execute(
            'INSERT INTO applications (candidate_id, job_id, cover_letter, cv_snapshot_url, status) VALUES (?, ?, ?, ?, ?)',
            [candidate_id, job_id, cover_letter || '', cv_url, 'pending']
        );

        res.status(201).json({ success: true, message: "Ứng tuyển thành công!" });
    } catch (error) {
        console.error("Lỗi INSERT DB:", error.message);
        res.status(500).json({ success: false, message: error.message });
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
                p.cv_url, -- [THÊM TỪ CODE MỚI]
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
                a.cv_snapshot_url, -- [THÊM TỪ CODE MỚI]
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
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn ứng tuyển" });
    }

    // [GIỮ NGUYÊN TỪ CODE CŨ] Tránh lỗi thiếu data hiển thị ở FE
    const [workExp] = await db.execute(
      `SELECT company_name, position, start_date, end_date, description FROM Work_Experience WHERE profile_id = (SELECT id FROM Profiles WHERE user_id = ?) ORDER BY start_date DESC`,
      [rows[0].candidate_id]
    );

    const [education] = await db.execute(
      `SELECT school_name, major, start_date, end_date FROM Education WHERE profile_id = (SELECT id FROM Profiles WHERE user_id = ?) ORDER BY start_date DESC`,
      [rows[0].candidate_id]
    );

    const [skills] = await db.execute(
      `SELECT s.name FROM User_Skills us JOIN Skills s ON us.skill_id = s.id WHERE us.profile_id = (SELECT id FROM Profiles WHERE user_id = ?)`,
      [rows[0].candidate_id]
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

  // [THÊM TỪ CODE MỚI] Validate allowedStatuses
  const allowedStatuses = ["pending", "reviewed", "interviewing", "accepted", "rejected"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Status không hợp lệ" });
  }

  try {
    // [THÊM TỪ CODE MỚI] Validate người sở hữu job
    const [applications] = await db.execute(
      `SELECT a.id FROM Applications a JOIN Jobs j ON a.job_id = j.id WHERE a.id = ? AND j.posted_by = ?`,
      [application_id, employer_id]
    );

    if (applications.length === 0) {
      return res.status(403).json({ success: false, message: "Không có quyền cập nhật" });
    }

    const [result] = await db.execute(
      "UPDATE Applications SET status = ? WHERE id = ?",
      [status, application_id],
    );

    res.status(200).json({ success: true, message: `Đã chuyển trạng thái sang: ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET EMPLOYER JOBS
// ======================================================
exports.getEmployerJobs = async (req, res) => {
  const employer_id = req.user.id;

  try {
    // [GIỮ NGUYÊN TỪ CODE CŨ] Tránh lỗi thiếu stats/location FE
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

        // Cập nhật câu query: Sửa lại các alias (AS) và bổ sung job_id để khớp hoàn toàn với Frontend
        const [rows] = await db.execute(`
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
        `, [userId]);

        res.status(200).json({ 
            success: true, 
            data: rows 
        }); 
    } catch (error) {
        console.error("Lỗi SQL:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ======================================================
// WITHDRAW APPLICATION (CHỨC NĂNG MỚI ĐƯỢC THÊM VÀO)
// ======================================================
exports.withdrawApplication = async (req, res) => {
  const candidate_id = req.user.id;
  const application_id = req.params.id;

  try {
    const [applications] = await db.execute(
      `SELECT id, status FROM Applications WHERE id = ? AND candidate_id = ?`,
      [application_id, candidate_id]
    );

    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn ứng tuyển" });
    }

    if (applications[0].status !== "pending") {
      return res.status(400).json({ success: false, message: "Chỉ có thể rút hồ sơ đang pending" });
    }

    await db.execute(`DELETE FROM Applications WHERE id = ?`, [application_id]);
    res.json({ success: true, message: "Đã rút hồ sơ ứng tuyển" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// NOTES (GIỮ NGUYÊN TỪ CODE CŨ)
// ======================================================
// ======================================================
// NOTES (ĐÃ SỬA LỖI 500 DO SAI TÊN PARAMS, GIỮ NGUYÊN LOGIC)
// ======================================================
exports.getNotes = async (req, res) => {
    // SỬA Ở ĐÂY: Thêm req.params.id để linh hoạt lấy tham số từ URL
    const application_id = req.params.id || req.params.application_id; 
    
    try {
        const [rows] = await db.execute(`
            SELECT n.id, n.content, n.created_at, u.username
            FROM Application_Notes n JOIN Users u ON n.author_id = u.id
            WHERE n.application_id = ? ORDER BY n.created_at ASC
        `, [application_id]);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Lỗi getNotes:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addNote = async (req, res) => {
    const { application_id, content } = req.body;
    const author_id = req.user.id;

    if (!content?.trim()) {
        return res.status(400).json({ success: false, message: "Nội dung ghi chú không được trống" });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO Application_Notes (application_id, author_id, content) VALUES (?, ?, ?)',
            [application_id, author_id, content.trim()]
        );

        const [newNote] = await db.execute(`
            SELECT n.id, n.content, n.created_at, u.username
            FROM Application_Notes n JOIN Users u ON n.author_id = u.id WHERE n.id = ?
        `, [result.insertId]);

        res.status(201).json({ success: true, data: newNote[0] });
    } catch (error) {
        console.error("Lỗi addNote:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteNote = async (req, res) => {
    // SỬA Ở ĐÂY: Thêm req.params.id 
    const note_id = req.params.id || req.params.note_id; 
    const author_id = req.user.id;

    try {
        const [result] = await db.execute(
            'DELETE FROM Application_Notes WHERE id = ? AND author_id = ?',
            [note_id, author_id]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ success: false, message: "Không có quyền xóa ghi chú này" });
        }

        res.status(200).json({ success: true, message: "Đã xóa ghi chú" });
    } catch (error) {
        console.error("Lỗi deleteNote:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ======================================================
// TOGGLE JOB STATUS (GIỮ NGUYÊN TỪ CODE CŨ)
// ======================================================
exports.toggleJobStatus = async (req, res) => {
    const { job_id } = req.body;
    const employer_id = req.user.id;

    try {
        const [jobs] = await db.execute(
            'SELECT id, status FROM Jobs WHERE id = ? AND posted_by = ?',
            [job_id, employer_id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tin tuyển dụng" });
        }

        const currentStatus = jobs[0].status;
        const newStatus = currentStatus === 'closed' ? 'approved' : 'closed';

        await db.execute('UPDATE Jobs SET status = ? WHERE id = ?', [newStatus, job_id]);

        res.status(200).json({
            success: true,
            message: newStatus === 'closed' ? 'Đã đóng tin tuyển dụng' : 'Đã mở lại tin tuyển dụng',
            new_status: newStatus
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};