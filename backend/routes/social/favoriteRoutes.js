const express = require('express');
const router = express.Router();

const { verifyToken } = require('../../middlewares/authMiddleware');

const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
} = require('../../controllers/social/favoriteController');

router.get('/', verifyToken, getFavorites);

router.post('/:jobId', verifyToken, addFavorite);

router.delete('/:jobId', verifyToken, removeFavorite);

router.get('/check/:jobId', verifyToken, checkFavorite);

module.exports = router;