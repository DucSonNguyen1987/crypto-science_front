# Crypto Science - Application de Portefeuille de Crypto-monnaies dy Duc-Son Nguyen

![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB)
![Redux](https://img.shields.io/badge/Redux-4.x-764ABC)
![Vite](https://img.shields.io/badge/Vite-4.x-646CFF)

Une application de gestion de portefeuille de crypto-monnaies avec une interface moderne glassmorphique, développée avec React, Redux et Vite. Ce projet est conçu pour démontrer des compétences avancées en développement frontend, architecture d'application et intégration API.

## 🌟 Caractéristiques

- 📊 Tableau de bord interactif avec graphiques et statistiques
- 💼 Gestion de portefeuille multi-crypto
- 📈 Visualisation des données historiques et tendances
- 📱 Interface utilisateur responsive et moderne
- 🔄 Mode démo avec données simulées (sans dépendance API)
- 🌓 Thème clair/sombre
- 🔍 Explorer le marché des crypto-monnaies
- 📝 Historique détaillé des transactions

## 📋 Table des matières

- [Démo](#-démo)
- [Installation](#-installation)
- [Architecture](#-architecture)
- [Fonctionnalités détaillées](#-fonctionnalités-détaillées)
- [Mode démo vs API réelle](#-mode-démo-vs-api-réelle)
- [Technologies utilisées](#-technologies-utilisées)
- [Structure du projet](#-structure-du-projet)
- [Déploiement](#-déploiement)
- [Licence](#-licence)

## 🚀 Démo

[Lien vers la démo en direct](#) (à venir)

## 💻 Installation

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn

### Étapes d'installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/votreusername/crypto-wallet.git
cd crypto-wallet
```

2. **Installer les dépendances**

```bash
npm install
# ou avec yarn
yarn install
```

3. **Variables d'environnement**

Créez un fichier `.env` à la racine du projet:

```env
VITE_COINMARKETCAP_API_KEY=votre_clé_api_ici
```

Note: L'application fonctionnera parfaitement sans clé API grâce au mode démo intégré.

4. **Lancer l'application en mode développement**

```bash
npm run dev
# ou avec yarn
yarn dev
```

L'application sera accessible à l'adresse `http://localhost:5173`

## 🏗 Architecture

L'application suit une architecture basée sur les principes de Clean Architecture et les bonnes pratiques React:

![Architecture de l'application](./docs/architecture-diagram.png)

### Couches principales:

1. **Interface utilisateur (UI)**
   - Composants React
   - Hooks personnalisés
   - Contexte React pour l'état global de l'UI

2. **Logique métier**
   - Redux pour la gestion d'état global
   - Slices Redux (toolkit) pour les domaines fonctionnels

3. **Services de données**
   - Service API abstrait
   - Implémentation CoinMarketCap
   - Service de données simulées

Cette architecture assure:
- Une séparation claire des préoccupations
- La testabilité des différentes couches
- La possibilité de changer facilement l'implémentation des services de données
- Un code maintenable et extensible

Pour plus de détails, consultez [ARCHITECTURE.md](./ARCHITECTURE.md).

## ✨ Fonctionnalités détaillées

### Tableau de bord

- Résumé du portefeuille avec valeur totale et performances
- Graphique d'évolution du portefeuille avec différentes périodes (24h, 1 semaine, 1 mois, 1 an)
- Liste des actifs avec indicateurs de performance
- Aperçu des tendances de marché globales

### Portefeuille

- Vue détaillée de tous les actifs
- Différentes visualisations (liste, graphique en camembert, allocation)
- Fonctionnalités d'ajout et de vente d'actifs
- Calcul automatique des performances et de la répartition

### Transactions

- Historique complet des transactions
- Filtrage par type, date et crypto-monnaie
- Tri personnalisable
- Export des données en CSV

### Exploration du marché

- Classement des crypto-monnaies
- Recherche par nom ou symbole
- Données de marché en temps réel
- Fonction d'ajout rapide au portefeuille

### Paramètres

- Personnalisation de l'interface
- Gestion du profil utilisateur
- Configuration des méthodes de paiement
- Préférences de notifications

## 🔄 Mode démo vs API réelle

L'application peut fonctionner dans deux modes:

### Mode démo (par défaut)

- Utilise des données simulées générées localement
- Aucun appel API externe nécessaire
- Évite les problèmes CORS
- Parfait pour les démonstrations et le développement
- Les données générées sont réalistes et cohérentes

### Mode API réelle

- Se connecte à l'API CoinMarketCap
- Nécessite une clé API (compte gratuit suffisant)
- Données de marché réelles et en direct
- Utilise un proxy configuré dans Vite pour éviter les problèmes CORS

Pour basculer entre les modes, utilisez le bouton dans la bannière de notification ou modifiez `API_CONFIG.defaultMode` dans `src/services/apiConfig.js`.

## 🛠 Technologies utilisées

- **Frontend:**
  - React 18
  - Redux Toolkit
  - React Router 6
  - Recharts (visualisation de données)
  - React Icons

- **Build & Développement:**
  - Vite
  - ESLint
  - Prettier

- **Styles:**
  - CSS Modules
  - Variables CSS
  - Design System personnalisé

- **API & Services:**
  - Axios
  - CoinMarketCap API (optionnel)
  - Service de données simulées personnalisé

## 📁 Structure du projet

```
crypto-wallet/
├── docs/                    # Documentation et ressources
├── public/                  # Ressources statiques
├── src/
│   ├── assets/              # Images, polices, etc.
│   ├── components/          # Composants réutilisables
│   ├── context/             # Contextes React
│   ├── features/            # Fonctionnalités (slices Redux)
│   ├── layout/              # Composants de mise en page
│   ├── pages/               # Composants de page
│   ├── services/            # Services d'API et utilitaires
│   ├── store/               # Configuration du store Redux
│   ├── styles/              # Styles globaux
│   ├── App.jsx              # Point d'entrée de l'application
│   └── main.jsx             # Point d'entrée React
├── .env.example             # Exemple de variables d'environnement
├── .eslintrc.js             # Configuration ESLint
├── .gitignore               # Fichiers ignorés par Git
├── index.html               # Template HTML principal
├── package.json             # Dépendances et scripts
├── README.md                # Documentation principale
└── vite.config.js           # Configuration Vite
```

## 📦 Déploiement

### Build de production

```bash
npm run build
# ou avec yarn
yarn build
```

Les fichiers générés seront dans le dossier `dist/`, prêts à être déployés sur n'importe quel hébergement statique.

### Plateformes recommandées

- **Vercel** - Déploiement automatique depuis GitHub
- **Netlify** - Facile à configurer avec l'intégration continue
- **GitHub Pages** - Solution gratuite et simple

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.