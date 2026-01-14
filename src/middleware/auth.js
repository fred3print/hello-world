/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Vous devez être connecté pour accéder à cette page');
  res.redirect('/login');
};

/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 */
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  req.flash('error', 'Accès réservé aux administrateurs');
  res.redirect('/dashboard');
};

/**
 * Middleware pour rediriger les utilisateurs déjà connectés
 */
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

/**
 * Middleware pour vérifier si l'email est vérifié
 */
const isEmailVerified = (req, res, next) => {
  if (req.session && req.session.isEmailVerified) {
    return next();
  }
  req.flash('error', 'Veuillez vérifier votre email avant de continuer');
  res.redirect('/verify-email');
};

module.exports = {
  isAuthenticated,
  isAdmin,
  redirectIfAuthenticated,
  isEmailVerified
};
