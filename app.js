require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import configuration et modèles
const { testConnection, sequelize } = require('./src/config/database');
const { syncDatabase } = require('./src/models');

// Import middleware personnalisés
const flash = require('./src/middleware/flash');

// Import routes
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const adminRoutes = require('./src/routes/admin');

// Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de la pool PostgreSQL pour les sessions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    require: true,
    rejectUnauthorized: false
  } : false
});

// Configuration du moteur de templates EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
app.use(limiter);

// Rate limiting spécifique pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.'
});

// Middleware de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Configuration des sessions
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'votre-secret-de-session-tres-securise',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Middleware flash messages
app.use(flash);

// Variables globales pour les vues
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    email: req.session.userEmail,
    role: req.session.userRole
  } : null;
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.isAdmin = req.session.userRole === 'admin';
  res.locals.appName = process.env.APP_NAME || 'Yara';
  next();
});

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

// Routes d'authentification avec rate limiting
app.use('/', authLimiter, authRoutes);

// Routes du dashboard
app.use('/dashboard', dashboardRoutes);

// Routes admin
app.use('/admin', adminRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page non trouvée' });
});

// Gestion des erreurs générales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).render('errors/500', {
    title: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await testConnection();

    // Synchronisation des modèles (en production, utiliser des migrations)
    await syncDatabase(false); // Ne pas forcer la recréation en production

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`✓ Serveur démarré sur le port ${PORT}`);
      console.log(`✓ Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
