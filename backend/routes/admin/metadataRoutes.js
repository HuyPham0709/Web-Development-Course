const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/admin/metadataController');
const { verifyToken, authorizeRole } = require('../../middlewares/authMiddleware');

// Categories
router.get('/categories', verifyToken, authorizeRole(['admin']), ctrl.getAllCategories);
router.post('/categories', verifyToken, authorizeRole(['admin']), ctrl.createCategory);
router.put('/categories/:id', verifyToken, authorizeRole(['admin']), ctrl.updateCategory);
router.delete('/categories/:id', verifyToken, authorizeRole(['admin']), ctrl.deleteCategory);

// locations
router.get('/locations', verifyToken, authorizeRole(['admin']), ctrl.getAlllocations);
router.post('/locations', verifyToken, authorizeRole(['admin']), ctrl.createLocation);
router.put('/locations/:id', verifyToken, authorizeRole(['admin']), ctrl.updateLocation);
router.delete('/locations/:id', verifyToken, authorizeRole(['admin']), ctrl.deleteLocation);

// Skills
router.get('/skills', verifyToken, authorizeRole(['admin']), ctrl.getAllSkills);
router.post('/skills', verifyToken, authorizeRole(['admin']), ctrl.createSkill);
router.put('/skills/:id', verifyToken, authorizeRole(['admin']), ctrl.updateSkill);
router.delete('/skills/:id', verifyToken, authorizeRole(['admin']), ctrl.deleteSkill);

module.exports = router;