const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const newsController = require('./controllers/newsController');
const favoriteController = require('./controllers/favoriteController');
const auth = require('./middleware/auth');

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// User
router.get('/me', auth, userController.getProfile);
router.put('/me', auth, userController.editProfile);

// News
router.get('/news', newsController.listNews);
router.get('/news/:id', newsController.getNewsDetail);
router.post('/news', newsController.createNews); // opcional (admin/dev)

// Favorites
router.get('/favorites', auth, favoriteController.listFavorites);
router.post('/favorites/:newsId/toggle', auth, favoriteController.toggleFavorite);
router.delete('/favorites/:newsId', auth, favoriteController.removeFavorite);

module.exports = router;
