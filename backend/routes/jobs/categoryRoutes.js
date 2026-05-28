const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/jobs/categoryController');


router.get('/', categoryController.getAllCategories); 

module.exports = router;