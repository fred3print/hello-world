const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification admin
router.use(isAuthenticated);
router.use(isAdmin);

// Dashboard admin
router.get('/dashboard', adminController.showAdminDashboard);

// Gestion des utilisateurs
router.get('/users', adminController.showUsers);
router.get('/users/:userId', adminController.showUserDetails);
router.post('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.post('/users/:userId/change-role', adminController.changeUserRole);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
