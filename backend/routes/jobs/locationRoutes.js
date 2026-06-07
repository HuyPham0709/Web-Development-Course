const express = require('express');
const router = express.Router();
const locationController = require('../../controllers/jobs/locationController');

router.get('/', locationController.getAlllocations);

module.exports = router;