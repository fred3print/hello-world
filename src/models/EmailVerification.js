const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const EmailVerification = sequelize.define('EmailVerification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'email_verifications'
});

// Méthode statique pour générer un code à 6 chiffres
EmailVerification.generateCode = function() {
  return crypto.randomInt(100000, 999999).toString();
};

// Méthode pour vérifier si le code est expiré
EmailVerification.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Méthode pour vérifier si le code peut encore être utilisé
EmailVerification.prototype.canBeUsed = function() {
  return !this.isUsed && !this.isExpired() && this.attempts < 5;
};

module.exports = EmailVerification;
