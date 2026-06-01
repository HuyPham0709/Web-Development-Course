// backend/controllers/ProfileController.js
const db = require('../../config/db');
const path = require('path');
const fs = require('fs');

// Import hàm upload từ file config mới tách
const { uploadToCloudinary } = require('../../config/cloudinary');

const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split("T")[0];
};

const getCloudinaryPublicId = (url) => {
    const splitUrl = url.split('/');
    const filenameWithExt = splitUrl[splitUrl.length - 1];
    const folder = splitUrl[splitUrl.length - 2];
    const filename = filenameWithExt.split('.')[0];
    return `job_finder/${folder}/${filename}`; 
};

// ─── 1. GET /api/profile ───────────────────────────────────────────────────────
// Lấy profile của user đang đăng nhập (qua JWT token)
exports.getMyProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        // ✅ ĐÃ SỬA: Lấy thêm trường avatar_url trực tiếp từ bảng Profiles
        const [profiles] = await db.query(
            `SELECT id, full_name, avatar_url, title, location, bio, cv_url FROM Profiles WHERE user_id = ?`,
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
            `SELECT company_name AS company, position AS role, description, start_date, end_date FROM Work_Experience WHERE profile_id = ?`,
            [profile.id]
        );

        const [skillsRows] = await db.query(
            `SELECT s.name FROM User_Skills us JOIN Skills s ON us.skill_id = s.id WHERE us.profile_id = ?`,
            [profile.id]
        );

        res.json({
            success: true,
            profile: { ...profile, bio: profile.bio || "" },
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
// Xem profile của một user bất kỳ qua id
exports.getProfile = async (req, res) => {
    const { userId } = req.params;
    try {
        const [profiles] = await db.query(`SELECT * FROM Profiles WHERE user_id = ?`, [userId]);
        if (profiles.length === 0) return res.status(404).json({ success: false, message: "Chưa có hồ sơ" });

        const profileId = profiles[0].id;

        // ✅ ĐÃ XÓA: Bỏ hoàn toàn câu SELECT bảng Users để check cấu hình cũ phức tạp

        const [experiences] = await db.query(`SELECT * FROM Work_Experience WHERE profile_id = ? ORDER BY start_date DESC`, [profileId]);
        const [education] = await db.query(`SELECT * FROM Education WHERE profile_id = ? ORDER BY start_date DESC`, [profileId]);
        const [skills] = await db.query(`SELECT s.id, s.name FROM Skills s JOIN User_Skills us ON s.id = us.skill_id WHERE us.profile_id = ?`, [profileId]);

        const personalInfo = profiles[0];
        if (typeof personalInfo.social_links === 'string') {
            try { personalInfo.social_links = JSON.parse(personalInfo.social_links); }
            catch { personalInfo.social_links = {}; }
        }

        // ✅ ĐÃ SỬA: Trả thẳng dữ liệu từ bảng Profiles về, không cần tính toán toggle chọn 1 trong 2 nữa
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
// Form cập nhật nhanh hồ sơ cá nhân
exports.updateMyProfile = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const userId = req.user.id;
        let { full_name, title, location, bio, experience, skills } = req.body;

        if (typeof experience === "string") experience = JSON.parse(experience);
        if (typeof skills === "string") skills = JSON.parse(skills);

        let cv_url = null;
        if (req.file) cv_url = `/uploads/cvs/${req.file.filename}`;

        const [profiles] = await connection.query("SELECT * FROM Profiles WHERE user_id = ?", [userId]);
        let profileId;

        if (profiles.length === 0) {
            const [result] = await connection.query(
                `INSERT INTO Profiles (user_id, full_name, title, location, bio, cv_url) VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, full_name, title, location, bio, cv_url]
            );
            profileId = result.insertId;
        } else {
            profileId = profiles[0].id;
            if (!cv_url) cv_url = profiles[0].cv_url;
            await connection.query(
                `UPDATE Profiles SET full_name = ?, title = ?, location = ?, bio = ?, cv_url = ? WHERE id = ?`,
                [full_name, title, location, bio, cv_url, profileId]
            );
        }

        await connection.query("DELETE FROM Work_Experience WHERE profile_id = ?", [profileId]);
        if (Array.isArray(experience)) {
            for (const exp of experience) {
                await connection.query(
                    `INSERT INTO Work_Experience (profile_id, company_name, position, description, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)`,
                    [profileId, exp.company, exp.role, exp.description || "", formatDate(exp.start_date), formatDate(exp.end_date)]
                );
            }
        }

        await connection.query("DELETE FROM User_Skills WHERE profile_id = ?", [profileId]);
        if (Array.isArray(skills)) {
            for (const skillName of skills) {
                if (!skillName) continue;
                let [skillRows] = await connection.query("SELECT * FROM Skills WHERE name = ?", [skillName]);
                let skillId = skillRows.length === 0 ? (await connection.query("INSERT INTO Skills (name) VALUES (?)", [skillName]))[0].insertId : skillRows[0].id;
                await connection.query("INSERT INTO User_Skills (profile_id, skill_id) VALUES (?, ?)", [profileId, skillId]);
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
// Hàm cập nhật toàn bộ thông tin chi tiết hồ sơ (CV)
exports.updateProfile = async (req, res) => {
    const { userId, personalInfo, experiences, education, skills } = req.body;
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // ✅ ĐÃ XÓA: Bỏ câu lệnh UPDATE bảng Users (bỏ hoàn toàn custom_name, use_custom_name...)

        // ✅ ĐÃ SỬA: Ghi đè thẳng thông tin full_name và avatar_url mới vào bảng Profiles
        await connection.query(
            `UPDATE Profiles 
             SET full_name = ?, title = ?, bio = ?, cv_url = ?, avatar_url = ?, cover_url = ?, 
                 phone = ?, gender = ?, dob = ?, location = ?, social_links = ? 
             WHERE user_id = ?`,
            [
                personalInfo.full_name || null, 
                personalInfo.title || null, 
                personalInfo.bio || null, 
                personalInfo.cv_url || null, 
                personalInfo.avatar_url || null, 
                personalInfo.cover_url || null, 
                personalInfo.phone || null, 
                personalInfo.gender || null, 
                personalInfo.dob || null, 
                personalInfo.location || null, 
                personalInfo.social_links ? JSON.stringify(personalInfo.social_links) : null, 
                userId
            ]
        );

        const [profileRows] = await connection.query(`SELECT id FROM Profiles WHERE user_id = ?`, [userId]);
        if (profileRows.length === 0) throw new Error("User profile not found!");
        const profileId = profileRows[0].id;

        // Cập nhật Kinh nghiệm làm việc
        await connection.query(`DELETE FROM Work_Experience WHERE profile_id = ?`, [profileId]);
        if (experiences && experiences.length > 0) {
            for (const exp of experiences) {
                await connection.query(
                    `INSERT INTO Work_Experience (profile_id, company_name, position, description, start_date, end_date, period_text) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [profileId, exp.company_name, exp.position, exp.description || null, formatDate(exp.start_date), formatDate(exp.end_date), `${formatDate(exp.start_date) || ''} - ${formatDate(exp.end_date) || 'Present'}`]
                );
            }
        }

        // Cập nhật Học vấn
        await connection.query(`DELETE FROM Education WHERE profile_id = ?`, [profileId]);
        if (education && education.length > 0) {
            for (const edu of education) {
                await connection.query(
                    `INSERT INTO Education (profile_id, school_name, major, gpa, start_date, end_date, description, period_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [profileId, edu.school_name, edu.major, edu.gpa || null, formatDate(edu.start_date), formatDate(edu.end_date), edu.description || null, `${formatDate(edu.start_date) || ''} - ${formatDate(edu.end_date) || 'Present'}`]
                );
            }
        }

        // Cập nhật Kỹ năng
        await connection.query(`DELETE FROM User_Skills WHERE profile_id = ?`, [profileId]);
        if (skills && skills.length > 0) {
            for (const skillName of skills) {
                let [skillRows] = await connection.query(`SELECT id FROM Skills WHERE name = ?`, [skillName]);
                let skillId = skillRows.length === 0 ? (await connection.query(`INSERT INTO Skills (name) VALUES (?)`, [skillName]))[0].insertId : skillRows[0].id;
                await connection.query(`INSERT INTO User_Skills (profile_id, skill_id) VALUES (?, ?)`, [profileId, skillId]);
            }
        }

        await connection.commit();
        res.status(200).json({ success: true, message: "Profile updated successfully!" });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("[updateProfile]", error.message);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

// ─── 5. UPLOAD CV ───────────────────────────────────────────
exports.uploadCV = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) return res.status(400).json({ success: false, message: 'I haven\'t received the CV file yet.' });

        const result = await uploadToCloudinary(req.file.buffer, 'job_finder/cvs');
        const secureUrl = result.secure_url;

        const [dbResult] = await db.query('UPDATE Profiles SET cv_url = ? WHERE user_id = ?', [secureUrl, userId]);
        if (dbResult.affectedRows === 0) return res.status(404).json({ success: false, message: 'You need to create your personal information first!' });

        res.json({ success: true, cv_url: secureUrl, message: 'CV uploaded successfully!' });
    } catch (error) {
        console.error('Error uploading CV:', error);
        res.status(500).json({ success: false, message: 'Error uploading CV', error: error.message });
    }
};

// ─── 6. DELETE CV ───────────────────────────────────────────
exports.deleteCV = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(`SELECT cv_url FROM Profiles WHERE user_id = ?`, [userId]);
        if (rows.length === 0 || !rows[0].cv_url) return res.status(404).json({ success: false, message: "CV not found" });

        const cvUrl = rows[0].cv_url;
        if (cvUrl.includes('cloudinary.com')) {
            const publicId = getCloudinaryPublicId(cvUrl);
            const { cloudinary } = require('../../config/cloudinary');
            await cloudinary.uploader.destroy(publicId);
        } else {
            const filePath = path.join(__dirname, '..', cvUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query(`UPDATE Profiles SET cv_url = NULL, updated_at = NOW() WHERE user_id = ?`, [userId]);
        res.status(200).json({ success: true, message: "CV has been deleted" });
    } catch (error) {
        console.error("[deleteCV]", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── 7. POST /api/profile/avatar ──────────────────────────────────────────────
exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) return res.status(400).json({ success: false, message: 'No avatar file received!' });

        const result = await uploadToCloudinary(req.file.buffer, 'job_finder/avatars');
        const secureUrl = result.secure_url;

        // ✅ ĐÃ SỬA: Chỉ cần UPDATE duy nhất trường avatar_url ở bảng Profiles là xong, bỏ hoàn toàn update bên Users
        await db.query(`UPDATE Profiles SET avatar_url = ? WHERE user_id = ?`, [secureUrl, userId]);

        res.json({ success: true, avatar_url: secureUrl, message: 'Avatar updated successfully!' });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        res.status(500).json({ success: false, message: 'Error uploading avatar' });
    }
};

// ─── 8. POST /api/profile/cover ───────────────────────────────────────────────
exports.uploadCover = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) return res.status(400).json({ success: false, message: 'No cover file received!' });

        const result = await uploadToCloudinary(req.file.buffer, 'job_finder/covers');
        const secureUrl = result.secure_url;

        await db.query(`UPDATE Profiles SET cover_url = ? WHERE user_id = ?`, [secureUrl, userId]);

        res.json({ success: true, cover_url: secureUrl, message: 'Cover updated successfully!' });
    } catch (error) {
        console.error("Error uploading cover:", error);
        res.status(500).json({ success: false, message: 'Error uploading cover' });
    }
};

// ─── 9. SEARCH CANDIDATES (ĐÃ CẬP NHẬT LỌC IGNORED) ──────────────────────────
exports.searchCandidates = async (req, res) => {
    try {
        const { keyword, location, skills, exp_min, exp_max } = req.query;
        const employerId = req.user.id; // Lấy ID của nhà tuyển dụng từ token

        let query = `
    SELECT 
        p.id, 
        p.user_id, 
        p.full_name AS name, 
        p.title, 
        p.location, 
        p.avatar_url AS avatar,
        p.phone,
        p.gender,
        p.dob,   
        (SELECT GROUP_CONCAT(s.name) FROM User_Skills us JOIN Skills s ON us.skill_id = s.id WHERE us.profile_id = p.id) AS skills,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(YEAR, start_date, IFNULL(end_date, CURRENT_DATE))), 0) FROM Work_Experience we WHERE we.profile_id = p.id) AS years_of_exp
    FROM Profiles p 
    JOIN Users u ON p.user_id = u.id 
    WHERE u.role = 'candidate' 
      AND u.is_active = 1 
      AND p.allow_employer_search = 1
      -- CHỖ MỚI THÊM: Không lấy ứng viên đã bị nhà tuyển dụng này ignore
      AND NOT EXISTS (
          SELECT 1 FROM employer_profile_views v 
          WHERE v.candidate_id = u.id 
          AND v.employer_id = ? 
          AND v.status = 'ignored'
      )
`;
        // Thêm employerId vào đầu danh sách tham số
        const queryParams = [employerId];

        if (keyword) { 
            query += ` AND (p.title LIKE ? OR p.full_name LIKE ?)`; 
            queryParams.push(`%${keyword}%`, `%${keyword}%`); 
        }
        if (location) { 
            query += ` AND p.location LIKE ?`; 
            queryParams.push(`%${location}%`); 
        }
        if (skills) {
            const skillList = skills.split(',').map(s => s.trim());
            for (let i = 0; i < skillList.length; i++) {
                query += ` AND EXISTS (SELECT 1 FROM User_Skills us JOIN Skills s ON us.skill_id = s.id WHERE us.profile_id = p.id AND s.name = ?)`;
                queryParams.push(skillList[i]);
            }
        }

        query += ` GROUP BY p.id`;
        
        let having = '';
        if (exp_min !== undefined && exp_min !== '') { 
            having += ` HAVING years_of_exp >= ?`; 
            queryParams.push(parseInt(exp_min)); 
        }
        if (exp_max !== undefined && exp_max !== '') { 
            having += (having ? ' AND ' : ' HAVING ') + ` years_of_exp <= ?`; 
            queryParams.push(parseInt(exp_max)); 
        }
        
        query += having;
        query += ` ORDER BY p.updated_at DESC`;

        const [rows] = await db.query(query, queryParams);
        const candidates = rows.map(row => ({
          id: row.id,
          user_id: row.user_id,
          name: row.name || 'Candidate',
          title: row.title || 'Not updated',
          exp: row.years_of_exp ? `${row.years_of_exp} years` : 'No experience',
          location: row.location || 'Not updated',
          skills: row.skills ? row.skills.split(',') : [],
          avatar: row.avatar || 'https://placehold.co/150'
        }));

        res.status(200).json({ success: true, data: candidates });
    } catch (error) {
        console.error('Search CV Error:', error);
        res.status(500).json({ success: false, message: 'Error searching CVs' });
    }
};