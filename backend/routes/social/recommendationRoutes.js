// backend/routes/recommendationRoutes.js

const express = require('express');

const router = express.Router();

const {
  getRecommendedjobs
} = require('../../controllers/social/recommendationController');

const {
  verifyToken
} = require('../../middlewares/authMiddleware');


// GET RECOMMENDED jobs
router.get(
  '/',
  verifyToken,
  getRecommendedjobs
);

module.exports = router;