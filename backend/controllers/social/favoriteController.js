const db = require('../../config/db');

// GET: Lấy danh sách việc làm đã lưu
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(`
      SELECT 
        j.id,
        j.title,
        j.slug,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.experience_level,
        j.created_at,
        c.name AS company_name,
        c.logo_url,
        l.name AS location_name,
        fj.created_at AS saved_at
      FROM Favorite_Jobs fj
      JOIN Jobs j ON fj.job_id = j.id
      JOIN Companies c ON j.company_id = c.id
      JOIN Locations l ON j.location_id = l.id
      WHERE fj.user_id = ? 
      AND j.deleted_at IS NULL
      ORDER BY fj.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// POST: Lưu việc làm
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    await db.query(
      'INSERT IGNORE INTO Favorite_Jobs (user_id, job_id) VALUES (?, ?)',
      [userId, jobId]
    );

    res.json({
      success: true,
      message: 'Đã lưu việc làm'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// DELETE: Bỏ lưu
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    await db.query(
      'DELETE FROM Favorite_Jobs WHERE user_id = ? AND job_id = ?',
      [userId, jobId]
    );

    res.json({
      success: true,
      message: 'Đã bỏ lưu'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET: Kiểm tra job đã lưu chưa
exports.checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const [rows] = await db.query(
      'SELECT 1 FROM Favorite_Jobs WHERE user_id = ? AND job_id = ?',
      [userId, jobId]
    );

    res.json({
      success: true,
      isSaved: rows.length > 0
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};