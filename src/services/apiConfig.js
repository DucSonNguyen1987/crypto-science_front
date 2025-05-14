// src/services/apiConfig.js
/**
 * Configuration centrale pour les services API
 * 
 * Ce fichier centralise les paramètres de configuration pour tous les services API
 * et permet de basculer facilement entre données réelles et simulées.
 */

// Mode de données : 'mock' pour données simulées, 'real' pour API réelle
export const DATA_MODE = {
  MOCK: 'mock',
  REAL: 'real'
};

// Configuration par défaut - Facilement modifiable pour le développement/déploiement
export const API_CONFIG = {
  // Mode données par défaut (utiliser 'mock' pour éviter les problèmes CORS)
  defaultMode: DATA_MODE.MOCK,
  
  // Configuration de l'API CoinMarketCap
  coinMarketCap: {
    baseUrl: '/api/coinmarketcap', // URL pour le proxy (vite.config.js)
    realBaseUrl: 'https://pro-api.coinmarketcap.com/v1',
    apiKey: import.meta.env.VITE_COINMARKETCAP_API_KEY || 'YOUR_API_KEY',
    defaultCurrency: 'EUR'
  },
  
  // Paramètres de mise à jour
  refreshIntervals: {
    prices: 60000, // 60 secondes pour les prix
    market: 300000  // 5 minutes pour les données de marché
  }
};

// Fonction utilitaire pour vérifier si on utilise le mode simulé
export const isMockMode = (currentMode = null) => {
  // Si un mode est fourni, l'utiliser, sinon utiliser le mode par défaut
  const mode = currentMode || API_CONFIG.defaultMode;
  return mode === DATA_MODE.MOCK;
};

export default API_CONFIG;