const { sequelize } = require('../config/database');
const User = require('./User');
const EmailVerification = require('./EmailVerification');

// Définir les relations
User.hasMany(EmailVerification, {
  foreignKey: 'userId',
  as: 'verifications'
});

EmailVerification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Fonction pour synchroniser la base de données
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✓ Base de données synchronisée');
  } catch (error) {
    console.error('✗ Erreur lors de la synchronisation de la base de données:', error);
  }
};

module.exports = {
  User,
  EmailVerification,
  syncDatabase
};
