// backend/routes/recommendationRoutes.js

const express = require('express');

const router = express.Router();

const {
  getRecommendedJobs
} = require('../controllers/recommendationController');

const {
  verifyToken
} = require('../middlewares/authMiddleware');


// GET RECOMMENDED JOBS
router.get(
  '/',
  verifyToken,
  getRecommendedJobs
);

module.exports = router;