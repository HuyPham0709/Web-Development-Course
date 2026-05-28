// backend/controllers/recommendationController.js

const db = require('../../config/db');

exports.getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy criteria + profile title (bỏ user_skills và work_experiences)
    const [[criteriaRows], [profileRows]] = await Promise.all([
      db.execute(`SELECT * FROM jobcriteria WHERE user_id = ?`, [userId]),
      db.execute(`SELECT title FROM profiles WHERE user_id = ? LIMIT 1`, [userId]),
    ]);

    const c = criteriaRows[0] || null;

    // Skills lấy từ jobcriteria.skills (chuỗi "React, TypeScript, Node.js")
    const userSkills = c?.skills
      ? c.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      : [];

    // Vị trí lấy từ profile title
    const userPositions = profileRows[0]?.title
      ? [profileRows[0].title.toLowerCase()]
      : [];

    // Lấy 50 jobs mới nhất
    const [jobs] = await db.execute(`
      SELECT
        j.id,
        j.title,
        j.salary_min,
        j.salary_max,
        j.job_type,
        j.experience_level,
        j.requirements,
        c.logo_url  AS company_logo,
        j.slug,
        j.created_at,
        c.name      AS company_name,
        l.name      AS location_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN locations  l ON j.location_id = l.id
      WHERE j.status = 'approved'
        AND j.deleted_at IS NULL
      ORDER BY j.created_at DESC
      LIMIT 50
    `);

    // Tính điểm từng job
    const scored = jobs.map(job => {
      let score = 0;
      const titleLower = job.title.toLowerCase();
      const reqLower = (job.requirements || '').toLowerCase();

      // ── A. Tiêu chí tìm việc (55đ) ──────────────────────────────
      if (c) {
        // Địa điểm (20đ) — ưu tiên cao nhất
        if (c.preferred_location && job.location_name) {
          if (job.location_name.toLowerCase().includes(c.preferred_location.toLowerCase())) {
            score += 20;
          } else {
            score -= 15; // sai địa điểm → trừ điểm
          }
        }

        // Vị trí mong muốn (15đ)
        if (c.desired_position) {
          const pos = c.desired_position.toLowerCase();
          if (titleLower.includes(pos) || pos.includes(titleLower.split(' ')[0])) {
            score += 15;
          }
        }

        // Loại công việc (8đ)
        if (c.job_type && job.job_type === c.job_type) score += 8;

        // Kinh nghiệm (7đ)
        if (c.experience_level && job.experience_level === c.experience_level) score += 7;

        // Lương (5đ)
        if (c.salary_min && job.salary_max >= c.salary_min) score += 5;
      }

      // ── B. Skills từ jobcriteria.skills (30đ) ───────────────────
      if (userSkills.length > 0) {
        const matchedSkills = userSkills.filter(skill =>
          reqLower.includes(skill) || titleLower.includes(skill)
        );
        const skillScore = Math.min(30, Math.round((matchedSkills.length / userSkills.length) * 30));
        score += skillScore;
      }

      // ── C. Vị trí từ profile title (15đ) ────────────────────────
      if (userPositions.length > 0) {
        const matchedPos = userPositions.some(pos =>
          titleLower.includes(pos.split(' ')[0]) || pos.includes(titleLower.split(' ')[0])
        );
        if (matchedPos) score += 15;
      }

      return { ...job, match_score: Math.min(100, Math.max(0, score)) };
    });

    // Lọc > 0, sort cao nhất trước, lấy top 6
    const result = scored
      .filter(j => j.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 6);

    // Fallback: không có gì match → trả 5 job mới nhất
    if (result.length === 0) {
      const fallback = jobs.slice(0, 5).map(j => ({ ...j, match_score: 0 }));
      return res.json({ success: true, jobs: fallback });
    }

    res.json({ success: true, jobs: result });

  } catch (error) {
    console.error('RECOMMENDATION ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};