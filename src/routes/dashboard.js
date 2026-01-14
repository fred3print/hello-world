const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated, isEmailVerified } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(isAuthenticated);
router.use(isEmailVerified);

// Dashboard principal
router.get('/', dashboardController.showDashboard);

// Profil utilisateur
router.get('/profile', dashboardController.showProfile);
router.post('/profile', dashboardController.updateProfile);

module.exports = router;
