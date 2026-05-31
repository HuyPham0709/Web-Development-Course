const express = require('express');
const router = express.Router();
const locationController = require('../../controllers/jobs/locationController');

router.get('/', locationController.getAllLocations);

module.exports = router;