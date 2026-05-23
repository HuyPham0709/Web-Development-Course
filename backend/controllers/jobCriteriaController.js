const db = require('../config/db');

// ========================================
// GET JOB CRITERIA
// ========================================
exports.getJobCriteria = async (req, res) => {
  try {

    const userId = req.user.id;

    const [rows] = await db.execute(
      `
      SELECT *
      FROM jobcriteria
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {

    console.error('Get Job Criteria Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



// ========================================
// CREATE OR UPDATE JOB CRITERIA
// ========================================
exports.saveJobCriteria = async (req, res) => {

  try {

    const userId = req.user.id;

    let {
      desired_position,
      industry,
      job_type,
      experience_level,
      career_level,
      salary_min,
      salary_max,
      preferred_location,
      workplace_type,
      skills,
      languages,
      preferred_companies,
      benefits,
      available_from,
      is_open_to_work
    } = req.body;


    // ========================================
    // CLEAN DATA
    // ========================================

    const cleanValue = (value) => {
      if (
        value === undefined ||
        value === null ||
        value === ''
      ) {
        return null;
      }

      return value;
    };

    desired_position = cleanValue(desired_position);
    industry = cleanValue(industry);
    job_type = cleanValue(job_type);
    experience_level = cleanValue(experience_level);
    career_level = cleanValue(career_level);

    salary_min = cleanValue(salary_min);
    salary_max = cleanValue(salary_max);


    preferred_location = cleanValue(preferred_location);

    workplace_type = cleanValue(workplace_type);

    skills = cleanValue(skills);
    languages = cleanValue(languages);

    preferred_companies = cleanValue(preferred_companies);

    benefits = cleanValue(benefits);

    available_from = cleanValue(available_from);

    is_open_to_work =
      is_open_to_work !== undefined
        ? Number(is_open_to_work)
        : 1;


    // ========================================
    // CHECK EXISTING
    // ========================================

    const [existing] = await db.execute(
      `
      SELECT id
      FROM jobcriteria
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );


    // ========================================
    // UPDATE
    // ========================================

    if (existing.length > 0) {

      await db.execute(
        `
        UPDATE jobcriteria
        SET
          desired_position = ?,
          industry = ?,
          job_type = ?,
          experience_level = ?,
          career_level = ?,
          salary_min = ?,
          salary_max = ?,
          preferred_location = ?,
          workplace_type = ?,
          skills = ?,
          languages = ?,
          preferred_companies = ?,
          benefits = ?,
          available_from = ?,
          is_open_to_work = ?,
          updated_at = NOW()
        WHERE user_id = ?
        `,
        [
          desired_position,
          industry,
          job_type,
          experience_level,
          career_level,
          salary_min,
          salary_max,
          
          preferred_location,
          workplace_type,
          skills,
          languages,
          preferred_companies,
          benefits,
          available_from,
          is_open_to_work,
          userId
        ]
      );

    }

    // ========================================
    // INSERT
    // ========================================

    else {

      await db.execute(
        `
        INSERT INTO jobcriteria (
          user_id,
          desired_position,
          industry,
          job_type,
          experience_level,
          career_level,
          salary_min,
          salary_max,
          
          preferred_location,
          workplace_type,
          skills,
          languages,
          preferred_companies,
          benefits,
          available_from,
          is_open_to_work,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          userId,
          desired_position,
          industry,
          job_type,
          experience_level,
          career_level,
          salary_min,
          salary_max,
          preferred_location,
          workplace_type,
          skills,
          languages,
          preferred_companies,
          benefits,
          available_from,
          is_open_to_work
        ]
      );
    }


    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    res.json({
      success: true,
      message: 'Job criteria saved successfully'
    });

  } catch (error) {

    console.error("=== JOB CRITERIA ERROR ===");
  console.error(error);
  console.error(error.message);

  res.status(500).json({
    success: false,
    message: error.message
  });
  }
};