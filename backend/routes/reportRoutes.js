const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
// Import middleware xác thực token (đảm bảo user phải login mới được report)
const authMiddleware = require('../middlewares/authMiddleware'); 

// Khớp với axios.post("http://127.0.0.1:5000/api/reports"...) ở Frontend
router.post('/', authMiddleware.verifyToken, reportController.createReport);

module.exports = router;