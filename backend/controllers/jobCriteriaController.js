
const db = require('../config/db');


// =============================
// GET JOB CRITERIA
// =============================
exports.getJobCriteria = async (req, res) => {

  try {

    const userId = req.user.id;

    const [rows] = await db.execute(
      `
      SELECT *
      FROM jobcriteria
      WHERE user_id = ?
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
      message: error.message
    });
  }
};



// =============================
// CREATE OR UPDATE JOB CRITERIA
// =============================
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
      preferred_salary_type,
      preferred_location,
      workplace_type,
      skills,
      languages,
      preferred_companies,
      benefits,
      available_from,
      is_open_to_work
    } = req.body;


    // =============================
    // FIX undefined => null
    // =============================

    desired_position = desired_position || null;
    industry = industry || null;
    job_type = job_type || null;
    experience_level = experience_level || null;
    career_level = career_level || null;

    salary_min = salary_min || null;
    salary_max = salary_max || null;

    preferred_salary_type = preferred_salary_type || null;

    preferred_location = preferred_location || null;

    workplace_type = workplace_type || null;

    skills = skills || null;
    languages = languages || null;
    preferred_companies = preferred_companies || null;
    benefits = benefits || null;

    available_from = available_from || null;

    is_open_to_work =
      is_open_to_work !== undefined
        ? is_open_to_work
        : 1;


    // =============================
    // CHECK EXISTING
    // =============================

    const [existing] = await db.execute(
      `
      SELECT id
      FROM jobcriteria
      WHERE user_id = ?
      `,
      [userId]
    );


    // =============================
    // UPDATE
    // =============================

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
          preferred_salary_type = ?,
          preferred_location = ?,
          workplace_type = ?,
          skills = ?,
          languages = ?,
          preferred_companies = ?,
          benefits = ?,
          available_from = ?,
          is_open_to_work = ?
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
          preferred_salary_type,
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

    // =============================
    // INSERT
    // =============================

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
          preferred_salary_type,
          preferred_location,
          workplace_type,
          skills,
          languages,
          preferred_companies,
          benefits,
          available_from,
          is_open_to_work
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          preferred_salary_type,
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


    res.json({
      success: true,
      message: 'Saved successfully'
    });

  } catch (error) {

    console.error('Save Job Criteria Error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

