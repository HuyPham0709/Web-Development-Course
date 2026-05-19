const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Endpoint công khai lấy danh sách công ty
router.get('/', companyController.getTopCompanies);

module.exports = router;