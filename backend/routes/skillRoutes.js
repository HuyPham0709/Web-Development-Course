const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

// Endpoint công khai lấy danh sách kỹ năng
router.get('/', skillController.getAllSkills);

module.exports = router;