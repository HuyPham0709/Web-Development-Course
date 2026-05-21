// backend/controllers/ProfileController.js
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split("T")[0];
};

// ─── 1. GET /api/profile ───────────────────────────────────────────────────────
// Lấy profile của user đang đăng nhập (qua JWT token)
exports.getMyProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const [profiles] = await db.query(
            `SELECT
                id,
                full_name,
                title,
                location,
                bio,
                cv_url
             FROM Profiles WHERE user_id = ?`,
            [userId]
        );

        if (profiles.length === 0) {
            return res.json({
                success: true,
                profile: null,
                experience: [],
                skills: [],
            });
        }

        const profile = profiles[0];

        const [experience] = await db.query(
            `SELECT
                company_name AS company,
                position     AS role,
                description,
                start_date,
                end_date
             FROM Work_Experience WHERE profile_id = ?`,
            [profile.id]
        );

        const [skillsRows] = await db.query(
            `SELECT s.name
             FROM User_Skills us
             JOIN Skills s ON us.skill_id = s.id
             WHERE us.profile_id = ?`,
            [profile.id]
        );

        res.json({
            success: true,
            profile: {
                ...profile,
                bio: profile.bio || "",
            },
            experience: experience.map(exp => ({
                ...exp,
                start_date: formatDate(exp.start_date),
                end_date: formatDate(exp.end_date),
            })),
            skills: skillsRows.map((s) => s.name),
        });

    } catch (error) {
        console.error("[getMyProfile]", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ─── 2. GET /api/profile/:userId ──────────────────────────────────────────────
// Lấy toàn bộ profile theo userId: personalInfo + experiences + education + skills
exports.getProfile = async (req, res) => {
    const { userId } = req.params;
    try {
        const [profiles] = await db.query(
            `SELECT * FROM Profiles WHERE user_id = ?`,
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: "Chưa có hồ sơ" });
        }

        const profileId = profiles[0].id;

        const [experiences] = await db.query(
            `SELECT * FROM Work_Experience WHERE profile_id = ? ORDER BY start_date DESC`,
            [profileId]
        );
        const [education] = await db.query(
            `SELECT * FROM Education WHERE profile_id = ? ORDER BY start_date DESC`,
            [profileId]
        );
        const [skills] = await db.query(
            `SELECT s.id, s.name FROM Skills s
             JOIN User_Skills us ON s.id = us.skill_id
             WHERE us.profile_id = ?`,
            [profileId]
        );

        // Parse social_links nếu là string JSON
        const personalInfo = profiles[0];
        if (typeof personalInfo.social_links === 'string') {
            try { personalInfo.social_links = JSON.parse(personalInfo.social_links); }
            catch { personalInfo.social_links = {}; }
        }

        res.status(200).json({
            success: true,
            personalInfo: {
                ...personalInfo,
                dob: formatDate(personalInfo.dob),
            },
            experiences: experiences.map(exp => ({
                ...exp,
                start_date: formatDate(exp.start_date),
                end_date: formatDate(exp.end_date),
            })),
            education: education.map(edu => ({
                ...edu,
                start_date: formatDate(edu.start_date),
                end_date: formatDate(edu.end_date),
            })),
            skills: skills.map(s => s.name),
        });

    } catch (error) {
        console.error("[getProfile]", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── 3. PUT /api/profile/me ───────────────────────────────────────────────────
// Cập nhật profile của user đang đăng nhập (qua JWT token) — dùng multipart/form-data
exports.updateMyProfile = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.user.id;

        let { full_name, title, location, bio, experience, skills } = req.body;

        if (typeof experience === "string") experience = JSON.parse(experience);
        if (typeof skills === "string")     skills     = JSON.parse(skills);

        let cv_url = null;
        if (req.file) {
            cv_url = `/uploads/cvs/${req.file.filename}`;
        }

        const [profiles] = await connection.query(
            "SELECT * FROM Profiles WHERE user_id = ?",
            [userId]
        );

        let profileId;

        if (profiles.length === 0) {
            const [result] = await connection.query(
                `INSERT INTO Profiles (user_id, full_name, title, location, bio, cv_url)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, full_name, title, location, bio, cv_url]
            );
            profileId = result.insertId;
        } else {
            profileId = profiles[0].id;
            if (!cv_url) cv_url = profiles[0].cv_url;

            await connection.query(
                `UPDATE Profiles
                 SET full_name = ?, title = ?, location = ?, bio = ?, cv_url = ?
                 WHERE id = ?`,
                [full_name, title, location, bio, cv_url, profileId]
            );
        }

        // ===== EXPERIENCE =====
        await connection.query(
            "DELETE FROM Work_Experience WHERE profile_id = ?",
            [profileId]
        );

        if (Array.isArray(experience)) {
            for (const exp of experience) {
                await connection.query(
                    `INSERT INTO Work_Experience
                     (profile_id, company_name, position, description, start_date, end_date)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        profileId,
                        exp.company,
                        exp.role,
                        exp.description || "",
                        formatDate(exp.start_date),
                        formatDate(exp.end_date),
                    ]
                );
            }
        }

        // ===== SKILLS =====
        await connection.query(
            "DELETE FROM User_Skills WHERE profile_id = ?",
            [profileId]
        );

        if (Array.isArray(skills)) {
            for (const skillName of skills) {
                if (!skillName) continue;

                let [skillRows] = await connection.query(
                    "SELECT * FROM Skills WHERE name = ?",
                    [skillName]
                );

                let skillId;
                if (skillRows.length === 0) {
                    const [newSkill] = await connection.query(
                        "INSERT INTO Skills (name) VALUES (?)",
                        [skillName]
                    );
                    skillId = newSkill.insertId;
                } else {
                    skillId = skillRows[0].id;
                }

                await connection.query(
                    "INSERT INTO User_Skills (profile_id, skill_id) VALUES (?, ?)",
                    [profileId, skillId]
                );
            }
        }

        await connection.commit();
        res.json({ success: true, message: "Profile updated" });

    } catch (error) {
        await connection.rollback();
        console.error("[updateMyProfile]", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    } finally {
        connection.release();
    }
};

// ─── 4. POST /api/profile/update ──────────────────────────────────────────────
// Lưu toàn bộ profile trong 1 request (transaction) — dùng JSON body
exports.updateProfile = async (req, res) => {
    const { userId, personalInfo, experiences, education, skills } = req.body;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Cập nhật bảng Profiles
        await connection.query(
            `UPDATE Profiles SET
                full_name    = ?,
                title        = ?,
                bio          = ?,
                cv_url       = ?,
                avatar_url   = ?,
                cover_url    = ?,
                phone        = ?,
                gender       = ?,
                dob          = ?,
                location     = ?,
                social_links = ?
             WHERE user_id = ?`,
            [
                personalInfo.full_name    || null,
                personalInfo.title        || null,
                personalInfo.bio          || null,
                personalInfo.cv_url       || null,
                personalInfo.avatar_url   || null,
                personalInfo.cover_url    || null,
                personalInfo.phone        || null,
                personalInfo.gender       || null,
                personalInfo.dob          || null,
                personalInfo.location     || null,
                personalInfo.social_links ? JSON.stringify(personalInfo.social_links) : null,
                userId,
            ]
        );

        const [profileRows] = await connection.query(
            `SELECT id FROM Profiles WHERE user_id = ?`,
            [userId]
        );
        if (profileRows.length === 0) throw new Error("Không tìm thấy hồ sơ người dùng!");
        const profileId = profileRows[0].id;

        // 2. Work_Experience — delete-then-insert
        await connection.query(
            `DELETE FROM Work_Experience WHERE profile_id = ?`,
            [profileId]
        );

        if (experiences && experiences.length > 0) {
            for (const exp of experiences) {
                await connection.query(
                    `INSERT INTO Work_Experience
                     (profile_id, company_name, position, description, start_date, end_date, period_text)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        profileId,
                        exp.company_name,
                        exp.position,
                        exp.description || null,
                        formatDate(exp.start_date),
                        formatDate(exp.end_date),
                        `${formatDate(exp.start_date) || ''} - ${formatDate(exp.end_date) || 'Present'}`,
                    ]
                );
            }
        }

        // 3. Education — delete-then-insert
        await connection.query(
            `DELETE FROM Education WHERE profile_id = ?`,
            [profileId]
        );

        if (education && education.length > 0) {
            for (const edu of education) {
                await connection.query(
                    `INSERT INTO Education
                     (profile_id, school_name, major, gpa, start_date, end_date, description, period_text)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        profileId,
                        edu.school_name,
                        edu.major,
                        edu.gpa || null,
                        formatDate(edu.start_date),
                        formatDate(edu.end_date),
                        edu.description || null,
                        `${formatDate(edu.start_date) || ''} - ${formatDate(edu.end_date) || 'Present'}`,
                    ]
                );
            }
        }

        // 4. Skills — upsert vào bảng Skills, rồi link vào User_Skills
        await connection.query(
            `DELETE FROM User_Skills WHERE profile_id = ?`,
            [profileId]
        );

        if (skills && skills.length > 0) {
            for (const skillName of skills) {
                let [skillRows] = await connection.query(
                    `SELECT id FROM Skills WHERE name = ?`,
                    [skillName]
                );
                let skillId;
                if (skillRows.length === 0) {
                    const [newSkill] = await connection.query(
                        `INSERT INTO Skills (name) VALUES (?)`,
                        [skillName]
                    );
                    skillId = newSkill.insertId;
                } else {
                    skillId = skillRows[0].id;
                }
                await connection.query(
                    `INSERT INTO User_Skills (profile_id, skill_id) VALUES (?, ?)`,
                    [profileId, skillId]
                );
            }
        }

        await connection.commit();
        res.status(200).json({ success: true, message: "Hồ sơ đã được lưu thành công!" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("[updateProfile]", error.message);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

// ─── 5. POST /api/profile/cv/upload ───────────────────────────────────────────
// Upload file CV (multer đã xử lý req.file trước khi vào đây)
exports.uploadCV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Không có file nào được upload" });
        }

        const userId = req.user.id;

        // ✅ Chuyển buffer sang base64, kèm mime type để frontend dùng được luôn
        const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        await db.query(
            `UPDATE Profiles SET cv_url = ?, updated_at = NOW() WHERE user_id = ?`,
            [base64, userId]
        );

        res.status(200).json({
            success: true,
            message: "CV đã được upload thành công",
            data: {
                cv_url: base64,
                original_name: req.file.originalname,
                size: req.file.size,
            },
        });

    } catch (error) {
        console.error("[uploadCV]", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ====================== UPLOAD AVATAR - BASE64 (GIỐNG CV) ======================
exports.uploadAvatar = async (req, res) => {
    try {
        console.log("=== UPLOAD AVATAR START ===");
        console.log("req.file:", req.file ? "✅ Có file" : "❌ Không có file");

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Không có file nào" });
        }

        const userId = req.user.id;
        const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        await db.query(
            `UPDATE Profiles SET avatar_url = ?, updated_at = NOW() WHERE user_id = ?`,
            [base64, userId]
        );

        console.log("✅ Avatar lưu thành công dưới dạng Base64");
        res.json({ 
            success: true, 
            message: "Cập nhật ảnh đại diện thành công", 
            avatar_url: base64 
        });

    } catch (error) {
        console.error("❌ [uploadAvatar]", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ====================== UPLOAD COVER - BASE64 ======================
exports.uploadCover = async (req, res) => {
    try {
        console.log("=== UPLOAD COVER START ===");
        console.log("req.file:", req.file ? "✅ Có file" : "❌ Không có file");

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Không có file nào" });
        }

        const userId = req.user.id;
        const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        await db.query(
            `UPDATE Profiles SET cover_url = ?, updated_at = NOW() WHERE user_id = ?`,
            [base64, userId]
        );

        console.log("✅ Cover lưu thành công dưới dạng Base64");
        res.json({ 
            success: true, 
            message: "Cập nhật ảnh bìa thành công", 
            cover_url: base64 
        });

    } catch (error) {
        console.error("❌ [uploadCover]", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── 6. DELETE /api/profile/cv ────────────────────────────────────────────────
// Xóa CV: xóa file khỏi disk + set cv_url = NULL
exports.deleteCV = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.query(
            `SELECT cv_url FROM Profiles WHERE user_id = ?`,
            [userId]
        );
        if (rows.length === 0 || !rows[0].cv_url) {
            return res.status(404).json({ success: false, message: "Không tìm thấy CV" });
        }

        const filePath = path.join(__dirname, '..', rows[0].cv_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await db.query(
            `UPDATE Profiles SET cv_url = NULL, updated_at = NOW() WHERE user_id = ?`,
            [userId]
        );

        res.status(200).json({ success: true, message: "CV đã được xóa" });

    } catch (error) {
        console.error("[deleteCV]", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
