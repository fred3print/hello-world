/**
 * Middleware simple pour gérer les messages flash
 */
const flash = (req, res, next) => {
  if (!req.session.flash) {
    req.session.flash = {};
  }

  // Fonction pour ajouter un message flash
  req.flash = (type, message) => {
    if (!req.session.flash[type]) {
      req.session.flash[type] = [];
    }
    req.session.flash[type].push(message);
  };

  // Rendre les messages flash disponibles dans les vues
  res.locals.messages = req.session.flash || {};

  // Nettoyer les messages flash après chaque requête
  req.session.flash = {};

  next();
};

module.exports = flash;
