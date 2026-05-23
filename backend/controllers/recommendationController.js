const db = require('../config/db');

exports.getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy đồng thời: criteria + skills + experiences
    const [[criteriaRows], [skillRows], [expRows]] = await Promise.all([
      db.execute(`SELECT * FROM jobcriteria WHERE user_id = ?`, [userId]),
      db.execute(`SELECT skill_name FROM user_skills WHERE user_id = ?`, [userId]),
      db.execute(`SELECT position, company_name FROM work_experiences WHERE user_id = ? ORDER BY start_date DESC LIMIT 3`, [userId]),
    ]);

    const c = criteriaRows[0] || null;
    const userSkills = skillRows.map(r => r.skill_name.toLowerCase());
    const userPositions = expRows.map(r => r.position.toLowerCase());

    // Lấy tất cả jobs approved
    const [jobs] = await db.execute(`
      SELECT
        j.id,
        j.title,
        j.salary_min,
        j.salary_max,
        j.job_type,
        j.experience_level,
        j.requirements,
        c.logo_url   AS company_logo,
        j.slug,
        j.created_at,
        c.name       AS company_name,
        l.name       AS location_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN locations  l ON j.location_id = l.id
      WHERE j.status = 'approved'
        AND j.deleted_at IS NULL
      ORDER BY j.created_at DESC
      LIMIT 50
    `);

    // Tính điểm cho từng job
    const scored = jobs.map(job => {
      let score = 0;
      const titleLower = job.title.toLowerCase();
      const reqLower = (job.requirements || '').toLowerCase();

      // ── A. Từ tiêu chí tìm việc (50 điểm) ──────────────────────
if (c) {
  // Địa điểm (20đ) ← ƯU TIÊN CAO NHẤT
  if (c.preferred_location && job.location_name) {
    if (job.location_name.toLowerCase().includes(c.preferred_location.toLowerCase())) score += 20;
  }

  // Vị trí mong muốn (15đ)
  if (c.desired_position) {
    const pos = c.desired_position.toLowerCase();
    if (titleLower.includes(pos) || pos.includes(titleLower.split(' ')[0])) score += 15;
  }

  // Loại công việc (8đ)
  if (c.job_type && job.job_type === c.job_type) score += 8;

  // Kinh nghiệm (7đ)
  if (c.experience_level && job.experience_level === c.experience_level) score += 7;

  // Lương (5đ) ← ít quan trọng nhất trong tiêu chí
  if (c.salary_min && job.salary_max >= c.salary_min) score += 5;

  // Nếu KHÔNG khớp địa điểm → trừ điểm nặng
  if (c.preferred_location && job.location_name) {
    if (!job.location_name.toLowerCase().includes(c.preferred_location.toLowerCase())) {
      score -= 15; // 👈 job trái địa điểm bị đẩy xuống dưới
    }
  }
}

      // ── B. Từ skills trong hồ sơ (30 điểm) ─────────────────────
      if (userSkills.length > 0) {
        const matchedSkills = userSkills.filter(skill =>
          reqLower.includes(skill) || titleLower.includes(skill)
        );
        // Tối đa 30đ, mỗi skill match = 30/totalSkills điểm
        const skillScore = Math.min(30, Math.round((matchedSkills.length / userSkills.length) * 30));
        score += skillScore;
      }

      // ── C. Từ kinh nghiệm làm việc (20 điểm) ───────────────────
      if (userPositions.length > 0) {
        const matchedPos = userPositions.some(pos =>
          titleLower.includes(pos.split(' ')[0]) || pos.includes(titleLower.split(' ')[0])
        );
        if (matchedPos) score += 20;
      }

      return { ...job, match_score: Math.min(100, score) };
    });

    // Lọc score > 0, sort cao nhất trước
    const result = scored
      .filter(j => j.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 6);

    // Nếu không có gì match → trả job mới nhất
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