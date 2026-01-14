const { User } = require('../models');
const { Op } = require('sequelize');

/**
 * Affiche le tableau de bord administrateur
 */
const showAdminDashboard = async (req, res) => {
  try {
    // Statistiques
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const verifiedUsers = await User.count({ where: { isEmailVerified: true } });
    const adminUsers = await User.count({ where: { role: 'admin' } });

    // Derniers utilisateurs inscrits
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'email', 'firstName', 'lastName', 'createdAt', 'isActive', 'isEmailVerified']
    });

    res.render('admin/dashboard', {
      title: 'Administration',
      stats: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        admins: adminUsers
      },
      recentUsers
    });
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard admin:', error);
    res.status(500).send('Une erreur est survenue');
  }
};

/**
 * Affiche la liste des utilisateurs
 */
const showUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { email: { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'isEmailVerified', 'lastLogin', 'createdAt']
    });

    const totalPages = Math.ceil(count / limit);

    res.render('admin/users', {
      title: 'Gestion des utilisateurs',
      users,
      pagination: {
        page,
        totalPages,
        total: count
      },
      search
    });
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
    res.status(500).send('Une erreur est survenue');
  }
};

/**
 * Active/Désactive un utilisateur
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Ne pas permettre de désactiver son propre compte
    if (user.id === req.session.userId) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas désactiver votre propre compte' });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      success: true,
      message: user.isActive ? 'Utilisateur activé' : 'Utilisateur désactivé',
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue' });
  }
};

/**
 * Change le rôle d'un utilisateur
 */
const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Ne pas permettre de changer son propre rôle
    if (user.id === req.session.userId) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas modifier votre propre rôle' });
    }

    await user.update({ role });

    res.json({
      success: true,
      message: `Rôle changé en ${role}`,
      role: user.role
    });
  } catch (error) {
    console.error('Erreur lors du changement de rôle:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue' });
  }
};

/**
 * Supprime un utilisateur
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Ne pas permettre de supprimer son propre compte
    if (user.id === req.session.userId) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue' });
  }
};

/**
 * Affiche les détails d'un utilisateur
 */
const showUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).send('Utilisateur non trouvé');
    }

    res.render('admin/user-details', {
      title: 'Détails utilisateur',
      userDetails: user
    });
  } catch (error) {
    console.error('Erreur lors du chargement des détails:', error);
    res.status(500).send('Une erreur est survenue');
  }
};

module.exports = {
  showAdminDashboard,
  showUsers,
  toggleUserStatus,
  changeUserRole,
  deleteUser,
  showUserDetails
};
