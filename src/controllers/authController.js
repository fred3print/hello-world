const { User, EmailVerification } = require('../models');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/sendgrid');
const { validationResult } = require('express-validator');

/**
 * Affiche la page d'inscription
 */
const showRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Inscription',
    error: null,
    success: null
  });
};

/**
 * Traite l'inscription d'un nouvel utilisateur
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Inscription',
        error: errors.array()[0].msg,
        success: null,
        formData: req.body
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Inscription',
        error: 'Cette adresse email est déjà utilisée',
        success: null,
        formData: req.body
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      isEmailVerified: false
    });

    // Générer un code de vérification
    const code = EmailVerification.generateCode();
    await EmailVerification.create({
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    // Envoyer l'email de vérification
    await sendVerificationEmail(email, code, firstName);

    // Stocker l'ID utilisateur en session pour la vérification
    req.session.pendingUserId = user.id;

    res.redirect('/verify-email');
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.render('auth/register', {
      title: 'Inscription',
      error: 'Une erreur est survenue lors de l\'inscription',
      success: null,
      formData: req.body
    });
  }
};

/**
 * Affiche la page de vérification d'email
 */
const showVerifyEmail = (req, res) => {
  if (!req.session.pendingUserId) {
    return res.redirect('/login');
  }

  res.render('auth/verify-email', {
    title: 'Vérification Email',
    error: null,
    success: null
  });
};

/**
 * Vérifie le code d'email
 */
const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.session.pendingUserId;

    if (!userId) {
      return res.redirect('/login');
    }

    // Trouver le code de vérification
    const verification = await EmailVerification.findOne({
      where: {
        userId,
        code,
        isUsed: false
      },
      order: [['createdAt', 'DESC']]
    });

    if (!verification) {
      return res.render('auth/verify-email', {
        title: 'Vérification Email',
        error: 'Code de vérification invalide',
        success: null
      });
    }

    if (!verification.canBeUsed()) {
      return res.render('auth/verify-email', {
        title: 'Vérification Email',
        error: 'Ce code est expiré ou a déjà été utilisé',
        success: null
      });
    }

    // Marquer le code comme utilisé
    await verification.update({ isUsed: true });

    // Activer l'email de l'utilisateur
    const user = await User.findByPk(userId);
    await user.update({ isEmailVerified: true });

    // Envoyer l'email de bienvenue
    await sendWelcomeEmail(user.email, user.firstName);

    // Connecter l'utilisateur
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.isEmailVerified = true;
    delete req.session.pendingUserId;

    req.flash('success', 'Votre email a été vérifié avec succès !');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.render('auth/verify-email', {
      title: 'Vérification Email',
      error: 'Une erreur est survenue lors de la vérification',
      success: null
    });
  }
};

/**
 * Renvoie un code de vérification
 */
const resendVerificationCode = async (req, res) => {
  try {
    const userId = req.session.pendingUserId;

    if (!userId) {
      return res.redirect('/login');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.redirect('/login');
    }

    // Générer un nouveau code
    const code = EmailVerification.generateCode();
    await EmailVerification.create({
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    // Envoyer l'email
    await sendVerificationEmail(user.email, code, user.firstName);

    res.render('auth/verify-email', {
      title: 'Vérification Email',
      error: null,
      success: 'Un nouveau code a été envoyé à votre adresse email'
    });
  } catch (error) {
    console.error('Erreur lors du renvoi du code:', error);
    res.render('auth/verify-email', {
      title: 'Vérification Email',
      error: 'Une erreur est survenue lors du renvoi du code',
      success: null
    });
  }
};

/**
 * Affiche la page de connexion
 */
const showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Connexion',
    error: null,
    success: null
  });
};

/**
 * Traite la connexion
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Connexion',
        error: errors.array()[0].msg,
        success: null,
        formData: req.body
      });
    }

    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.render('auth/login', {
        title: 'Connexion',
        error: 'Email ou mot de passe incorrect',
        success: null,
        formData: req.body
      });
    }

    // Vérifier si le compte est verrouillé
    if (user.isLocked()) {
      return res.render('auth/login', {
        title: 'Connexion',
        error: 'Compte temporairement verrouillé. Réessayez dans quelques minutes.',
        success: null,
        formData: req.body
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.render('auth/login', {
        title: 'Connexion',
        error: 'Votre compte a été désactivé. Contactez un administrateur.',
        success: null,
        formData: req.body
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      return res.render('auth/login', {
        title: 'Connexion',
        error: 'Email ou mot de passe incorrect',
        success: null,
        formData: req.body
      });
    }

    // Réinitialiser les tentatives de connexion
    await user.resetLoginAttempts();

    // Si l'email n'est pas vérifié
    if (!user.isEmailVerified) {
      req.session.pendingUserId = user.id;
      return res.redirect('/verify-email');
    }

    // Créer la session
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.isEmailVerified = true;

    // Rediriger selon le rôle
    if (user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.render('auth/login', {
      title: 'Connexion',
      error: 'Une erreur est survenue lors de la connexion',
      success: null,
      formData: req.body
    });
  }
};

/**
 * Déconnexion
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
    res.redirect('/login');
  });
};

module.exports = {
  showRegister,
  register,
  showVerifyEmail,
  verifyEmail,
  resendVerificationCode,
  showLogin,
  login,
  logout
};
