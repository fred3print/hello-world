const { User } = require('../models');

/**
 * Affiche le tableau de bord utilisateur
 */
const showDashboard = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);

    res.render('dashboard/index', {
      title: 'Tableau de bord',
      user
    });
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error);
    res.status(500).send('Une erreur est survenue');
  }
};

/**
 * Affiche le profil utilisateur
 */
const showProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);

    res.render('dashboard/profile', {
      title: 'Mon profil',
      user,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
    res.status(500).send('Une erreur est survenue');
  }
};

/**
 * Met à jour le profil utilisateur
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findByPk(req.session.userId);

    await user.update({
      firstName,
      lastName
    });

    res.render('dashboard/profile', {
      title: 'Mon profil',
      user,
      error: null,
      success: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    const user = await User.findByPk(req.session.userId);
    res.render('dashboard/profile', {
      title: 'Mon profil',
      user,
      error: 'Une erreur est survenue lors de la mise à jour',
      success: null
    });
  }
};

module.exports = {
  showDashboard,
  showProfile,
  updateProfile
};
