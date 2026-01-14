# Yara - Système de Gestion des Utilisateurs Sécurisé

Application Node.js/Express avec authentification sécurisée, validation email et interface d'administration.

## ✨ Fonctionnalités

- ✅ **Authentification complète** : Inscription, connexion, déconnexion
- 📧 **Validation email obligatoire** : Code à 6 chiffres envoyé par email (Brevo)
- 🔒 **Restriction domaine** : Seules les adresses @sprint.fr sont autorisées
- 🛡️ **Sécurité renforcée** :
  - Hashage des mots de passe (bcrypt)
  - Protection contre les attaques brute-force (rate limiting)
  - Sessions sécurisées stockées en PostgreSQL
  - Verrouillage automatique après 5 tentatives
- 👥 **Interface d'administration** :
  - Dashboard avec statistiques
  - Gestion des utilisateurs (activation/désactivation)
  - Gestion des rôles (user/admin)
  - Recherche et pagination
- 🎨 **Design moderne** : Bootstrap 5.3, responsive, animations

## 🛠️ Stack Technique

**Backend :**
- Node.js + Express
- PostgreSQL (Sequelize ORM)
- Sessions sécurisées (express-session + connect-pg-simple)

**Frontend :**
- EJS (templating)
- Bootstrap 5.3
- Bootstrap Icons

**Sécurité :**
- bcrypt (hashage mots de passe)
- helmet (headers HTTP sécurisés)
- express-rate-limit (limitation de requêtes)
- express-validator (validation des données)

**Email :**
- Brevo (anciennement Sendinblue - envoi d'emails)

## 📋 Prérequis

- Node.js 18.x ou supérieur
- PostgreSQL
- Compte Brevo (gratuit : 300 emails/jour)
- Compte Heroku (pour le déploiement)

## 🚀 Installation locale

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/hello-world.git
cd hello-world
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer PostgreSQL

Créer une base de données PostgreSQL :

```bash
createdb yara_db
```

### 4. Configuration des variables d'environnement

Copier `.env.example` vers `.env` et configurer :

```bash
cp .env.example .env
```

Éditer `.env` :

```env
# Application
NODE_ENV=development
PORT=3000
SESSION_SECRET=votre-secret-aleatoire-tres-long

# Database
DATABASE_URL=postgres://username:password@localhost:5432/yara_db

# Brevo (anciennement Sendinblue)
BREVO_API_KEY=votre-cle-brevo
BREVO_FROM_EMAIL=noreply@votredomaine.com
BREVO_FROM_NAME=Yara

# Application
APP_NAME=Yara
APP_URL=http://localhost:3000
ALLOWED_EMAIL_DOMAIN=sprint.fr
```

### 5. Obtenir une clé API Brevo

1. Créer un compte gratuit sur [Brevo](https://www.brevo.com/) (anciennement Sendinblue)
2. Aller dans **Settings > API Keys** (dans le menu en haut à droite)
3. Cliquer sur **"Generate a new API key"**
4. Donner un nom à la clé (ex: "Yara Production")
5. Copier la clé et la coller dans `.env` : `BREVO_API_KEY=xkeysib-...`

### 6. Lancer l'application

```bash
npm start
```

Pour le développement avec rechargement automatique :

```bash
npm run dev
```

L'application sera accessible sur : http://localhost:3000

## 🌐 Déploiement sur Heroku

### 1. Prérequis Heroku

- Compte Heroku
- Heroku CLI installé
- Application Heroku créée
- Repository GitHub connecté

### 2. Ajouter PostgreSQL

Dans le dashboard Heroku :
- Aller dans l'onglet "Resources"
- Chercher "Heroku Postgres"
- Ajouter le plan gratuit "Hobby Dev"

### 3. Configurer les variables d'environnement

Dans "Settings" > "Config Vars", ajouter :

```
NODE_ENV=production
SESSION_SECRET=votre-secret-tres-securise
BREVO_API_KEY=votre-cle-brevo
BREVO_FROM_EMAIL=noreply@votredomaine.com
BREVO_FROM_NAME=Yara
APP_NAME=Yara
APP_URL=https://votre-app.herokuapp.com
ALLOWED_EMAIL_DOMAIN=sprint.fr
```

Note : `DATABASE_URL` est automatiquement configurée par Heroku Postgres.

### 3.1. Obtenir une clé API Brevo

**Brevo est gratuit et offre 300 emails/jour** (vs 100 pour SendGrid) :

1. Créer un compte gratuit sur **[Brevo.com](https://www.brevo.com/)** (anciennement Sendinblue)
2. Vérifier votre email
3. Aller dans **Settings** (icône en haut à droite) > **SMTP & API** > **API Keys**
4. Cliquer sur **"Generate a new API key"**
5. Donner un nom : "Yara Production"
6. Copier la clé (format : `xkeysib-...`)
7. La coller dans les Config Vars Heroku : `BREVO_API_KEY`

**Important** : Vous devez aussi configurer un expéditeur vérifié :
1. Dans Brevo, aller dans **Senders & IP**
2. Ajouter votre email d'expédition (ou utiliser celui de Brevo)
3. Vérifier l'email si nécessaire
4. Utiliser cet email dans `BREVO_FROM_EMAIL`

### 4. Déployer depuis GitHub

1. Dans l'onglet "Deploy"
2. Section "Deployment method" : GitHub doit être connecté ✓
3. Section "Connect to GitHub" : Sélectionner le repo "hello-world"
4. Section "Manual deploy" : Sélectionner la branche `claude/create-stock-course-landing-duhQv`
5. Cliquer sur "Deploy Branch"

### 5. (Optionnel) Activer le déploiement automatique

Dans "Automatic deploys" :
- Sélectionner la branche
- Cliquer sur "Enable Automatic Deploys"

## 📁 Structure du projet

```
hello-world/
├── app.js                      # Point d'entrée de l'application
├── package.json                # Dépendances
├── Procfile                    # Configuration Heroku
├── .env.example                # Template des variables d'environnement
├── .gitignore                  # Fichiers à ignorer par Git
│
├── src/
│   ├── config/
│   │   └── database.js         # Configuration PostgreSQL
│   │
│   ├── models/
│   │   ├── index.js            # Export et relations des modèles
│   │   ├── User.js             # Modèle Utilisateur
│   │   └── EmailVerification.js # Modèle Vérification Email
│   │
│   ├── controllers/
│   │   ├── authController.js   # Logique authentification
│   │   ├── dashboardController.js # Logique dashboard utilisateur
│   │   └── adminController.js  # Logique administration
│   │
│   ├── routes/
│   │   ├── auth.js             # Routes d'authentification
│   │   ├── dashboard.js        # Routes dashboard
│   │   └── admin.js            # Routes admin
│   │
│   ├── middleware/
│   │   ├── auth.js             # Middleware d'authentification
│   │   └── flash.js            # Middleware messages flash
│   │
│   ├── utils/
│   │   └── brevo.js            # Utilitaires Brevo (envoi emails)
│   │
│   └── views/                  # Templates EJS
│       ├── partials/
│       │   ├── header.ejs
│       │   └── footer.ejs
│       ├── auth/
│       │   ├── login.ejs
│       │   ├── register.ejs
│       │   └── verify-email.ejs
│       ├── dashboard/
│       │   ├── index.ejs
│       │   └── profile.ejs
│       ├── admin/
│       │   ├── dashboard.ejs
│       │   └── users.ejs
│       └── errors/
│           ├── 404.ejs
│           └── 500.ejs
│
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   └── images/
│
└── landing/                    # Ancienne landing page (archive)
    ├── index.html
    ├── index.php
    └── composer.json
```

## 👤 Créer le premier compte admin

### Méthode 1 : Via la base de données (recommandée)

Après la première inscription, se connecter à la base PostgreSQL :

```bash
# Local
psql yara_db

# Heroku
heroku pg:psql
```

Promouvoir un utilisateur en admin :

```sql
UPDATE users SET role = 'admin' WHERE email = 'votre.email@sprint.fr';
```

### Méthode 2 : Via l'application

1. S'inscrire avec une adresse @sprint.fr
2. Vérifier l'email avec le code reçu
3. Se connecter à PostgreSQL et changer le rôle (voir méthode 1)
4. Se reconnecter à l'application

## 🔐 Sécurité

### Mot de passe

- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Hashé avec bcrypt (10 rounds)

### Protection brute-force

- Maximum 5 tentatives de connexion
- Verrouillage du compte pendant 15 minutes après 5 échecs
- Rate limiting global : 100 requêtes / 15 minutes
- Rate limiting auth : 10 tentatives / 15 minutes

### Sessions

- Stockées en PostgreSQL (pas en mémoire)
- Cookie sécurisé (httpOnly, secure en production)
- Expiration : 24 heures

## 🎯 Utilisation

### Inscription

1. Aller sur `/register`
2. Remplir le formulaire (email @sprint.fr obligatoire)
3. Recevoir le code par email
4. Valider le code sur `/verify-email`
5. Accéder au dashboard

### Connexion

1. Aller sur `/login`
2. Saisir email et mot de passe
3. Accéder au dashboard

### Administration

Pour les comptes admin :
- Accéder à `/admin/dashboard`
- Voir les statistiques
- Gérer les utilisateurs
- Activer/désactiver des comptes
- Changer les rôles
- Supprimer des utilisateurs

## 🐛 Dépannage

### Erreur de connexion PostgreSQL

Vérifier que PostgreSQL est lancé :
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Emails non reçus

- Vérifier la clé API Brevo dans `.env`
- Vérifier que l'email expéditeur est vérifié dans Brevo
- Vérifier les spams
- Vérifier les quotas Brevo (300/jour gratuit)

### Erreur de session

Supprimer la table session :
```sql
DROP TABLE session;
```
Elle sera recréée automatiquement au redémarrage.

## 📝 Scripts disponibles

```bash
npm start          # Lancer en production
npm run dev        # Lancer en dev avec nodemon
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

ISC

## 👨‍💻 Auteur

Développé avec ❤️ pour Yara
