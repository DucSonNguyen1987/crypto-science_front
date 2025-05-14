// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import walletReducer from '../features/wallet/walletSlice';
import marketReducer from '../features/market/marketSlice';
import authReducer from '../features/auth/authSlice';

/**
 * Configuration du store Redux pour l'application de wallet crypto
 * 
 * Cette configuration utilise Redux Toolkit pour simplifier la gestion d'état
 * avec des slices pour chaque domaine fonctionnel.
 */
export const store = configureStore({
  reducer: {
    // Le reducer wallet gère les actifs de l'utilisateur et les transactions
    wallet: walletReducer,
    
    // Le reducer market gère les données de marché et les prix des crypto-monnaies
    market: marketReducer,
    
    // Le reducer auth gère l'authentification et les données utilisateur
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Désactive la vérification de sérialisation pour permettre les objets Date, etc.
      serializableCheck: false,
    }),
  // Active les Redux DevTools en mode développement
  devTools: import.meta.env.NODE_ENV !== 'production',
});

/**
 * Démarrage de l'application
 * 
 * Actions à exécuter au démarrage de l'application, comme charger les données
 * initiales depuis le stockage local ou une API.
 */
const initializeApp = () => {
  // Exemple : charger les données du portefeuille depuis le localStorage
  try {
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      // Dispatcher une action pour initialiser le wallet avec les données sauvegardées
      // store.dispatch(setInitialWallet(JSON.parse(savedWallet)));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données sauvegardées:', error);
  }
};

// Initialiser l'application
initializeApp();

// Exporter le store pour l'utiliser dans l'application
export default store;