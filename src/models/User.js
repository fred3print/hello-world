const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      isSprintEmail(value) {
        if (!value.endsWith('@sprint.fr')) {
          throw new Error('Seules les adresses email @sprint.fr sont autorisées');
        }
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    allowNull: false
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Méthode pour comparer les mots de passe
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour vérifier si le compte est verrouillé
User.prototype.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Méthode pour incrémenter les tentatives de connexion
User.prototype.incrementLoginAttempts = async function() {
  // Si le verrouillage a expiré, réinitialiser les tentatives
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.update({
      loginAttempts: 1,
      lockUntil: null
    });
  }

  // Incrémenter les tentatives
  const updates = { loginAttempts: this.loginAttempts + 1 };

  // Verrouiller le compte après 5 tentatives (15 minutes)
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }

  return await this.update(updates);
};

// Méthode pour réinitialiser les tentatives de connexion
User.prototype.resetLoginAttempts = async function() {
  return await this.update({
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: new Date()
  });
};

module.exports = User;
