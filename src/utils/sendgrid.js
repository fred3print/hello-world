const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Configuration SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envoie un email de vérification avec code à 6 chiffres
 * @param {string} to - Email du destinataire
 * @param {string} code - Code de vérification à 6 chiffres
 * @param {string} firstName - Prénom de l'utilisateur (optionnel)
 */
const sendVerificationEmail = async (to, code, firstName = '') => {
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.SENDGRID_FROM_NAME || 'Yara'
    },
    subject: 'Code de vérification - Yara',
    text: `Bonjour ${firstName},\n\nVotre code de vérification est : ${code}\n\nCe code est valide pendant 15 minutes.\n\nSi vous n'avez pas demandé ce code, veuillez ignorer cet email.\n\nCordialement,\nL'équipe Yara`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
          }
          .code-box {
            background-color: #fff;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #667eea;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Bienvenue sur Yara ! 🎉</h2>
          <p>Bonjour ${firstName},</p>
          <p>Votre code de vérification est :</p>
          <div class="code-box">${code}</div>
          <p>Ce code est valide pendant <strong>15 minutes</strong>.</p>
          <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
          <div class="footer">
            <p>Cordialement,<br>L'équipe Yara</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✓ Email de vérification envoyé à ${to}`);
    return { success: true };
  } catch (error) {
    console.error('✗ Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoie un email de bienvenue après vérification
 * @param {string} to - Email du destinataire
 * @param {string} firstName - Prénom de l'utilisateur
 */
const sendWelcomeEmail = async (to, firstName) => {
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.SENDGRID_FROM_NAME || 'Yara'
    },
    subject: 'Bienvenue sur Yara ! 🎉',
    text: `Bonjour ${firstName},\n\nVotre compte a été activé avec succès !\n\nVous pouvez maintenant vous connecter à votre espace.\n\nCordialement,\nL'équipe Yara`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            color: white;
          }
          .button {
            display: inline-block;
            background-color: #fff;
            color: #667eea;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Bienvenue sur Yara ! 🎉</h2>
          <p>Bonjour ${firstName},</p>
          <p>Votre compte a été activé avec succès !</p>
          <p>Vous pouvez maintenant vous connecter à votre espace.</p>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" class="button">Se connecter</a>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✓ Email de bienvenue envoyé à ${to}`);
    return { success: true };
  } catch (error) {
    console.error('✗ Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
};
