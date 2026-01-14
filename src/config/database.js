const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration de la base de données PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/yara_db', {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test de connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Connexion PostgreSQL établie avec succès');
  } catch (error) {
    console.error('✗ Impossible de se connecter à la base de données:', error);
  }
};

module.exports = { sequelize, testConnection };
