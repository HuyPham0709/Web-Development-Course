const express = require('express');

const router = express.Router();

const {
  getJobCriteria,
  saveJobCriteria
} = require('../../controllers/jobs/jobCriteriaController');

const authMiddleware = require('../../middlewares/authMiddleware');

router.get(
  '/',
  authMiddleware.verifyToken,
  getJobCriteria
);

router.put(
  '/',
  authMiddleware.verifyToken,
  saveJobCriteria
);

module.exports = router;