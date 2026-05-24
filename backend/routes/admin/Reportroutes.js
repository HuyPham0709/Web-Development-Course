const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/admin/Reportcontroller');
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

router.get('/', verifyToken, authorizeRole(['admin']), ctrl.getReports);
router.put('/:id/status', verifyToken, authorizeRole(['admin']), ctrl.updateReportStatus);
router.delete('/:id/job', verifyToken, authorizeRole(['admin']), ctrl.deleteReportedJob);

module.exports = router;