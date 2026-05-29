const db = require('../../config/db');

// ========================================
// GET JOB CRITERIA
// ========================================
exports.getJobCriteria = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      `SELECT * FROM jobcriteria WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (rows.length === 0) return res.json({ success: true, data: null });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Get Job Criteria Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ========================================
// CREATE OR UPDATE JOB CRITERIA
// ========================================
exports.saveJobCriteria = async (req, res) => {
  try {
    const userId = req.user.id;

    const cleanValue = (value) =>
      value === undefined || value === null || value === '' ? null : value;

    const desired_position    = cleanValue(req.body.desired_position);
    const industry            = cleanValue(req.body.industry);
    const job_type            = cleanValue(req.body.job_type);
    const experience_level    = cleanValue(req.body.experience_level);
    const career_level        = cleanValue(req.body.career_level);
    const salary_min          = cleanValue(req.body.salary_min);
    const salary_max          = cleanValue(req.body.salary_max);
    const preferred_location  = cleanValue(req.body.preferred_location);
    const workplace_type      = cleanValue(req.body.workplace_type);
    const skills              = cleanValue(req.body.skills);
    const languages           = cleanValue(req.body.languages);
    const preferred_companies = cleanValue(req.body.preferred_companies);
    const benefits            = cleanValue(req.body.benefits);
    const available_from      = cleanValue(req.body.available_from);
    const is_open_to_work     = req.body.is_open_to_work !== undefined
                                  ? Number(req.body.is_open_to_work) : 1;

    const [existing] = await db.execute(
      `SELECT id FROM jobcriteria WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (existing.length > 0) {
      // ── UPDATE ──────────────────────────────────────────────
      await db.execute(
        `UPDATE jobcriteria SET
          desired_position    = ?,
          industry            = ?,
          job_type            = ?,
          experience_level    = ?,
          career_level        = ?,
          salary_min          = ?,
          salary_max          = ?,
          preferred_location  = ?,
          workplace_type      = ?,
          skills              = ?,
          languages           = ?,
          preferred_companies = ?,
          benefits            = ?,
          available_from      = ?,
          is_open_to_work     = ?,
          updated_at          = NOW()
        WHERE user_id = ?`,
        [
          desired_position, industry, job_type, experience_level,
          career_level, salary_min, salary_max, preferred_location,
          workplace_type, skills, languages, preferred_companies,
          benefits, available_from, is_open_to_work,
          userId  // WHERE user_id = ?
        ]
      );
    } else {
      // ── INSERT ──────────────────────────────────────────────
      await db.execute(
        `INSERT INTO jobcriteria (
          user_id, desired_position, industry, job_type,
          experience_level, career_level, salary_min, salary_max,
          preferred_location, workplace_type, skills, languages,
          preferred_companies, benefits, available_from,
          is_open_to_work, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, NOW(), NOW()
        )`,
        [
          userId, desired_position, industry, job_type,
          experience_level, career_level, salary_min, salary_max,
          preferred_location, workplace_type, skills, languages,
          preferred_companies, benefits, available_from,
          is_open_to_work
        ]
      );
    }

    res.json({ success: true, message: 'Job criteria saved successfully' });

  } catch (error) {
    console.error('=== JOB CRITERIA ERROR ===', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};