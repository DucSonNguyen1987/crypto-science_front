// src/services/coinMarketCapService.js
/**
 * Service d'intégration avec l'API CoinMarketCap
 * 
 * Ce service gère toutes les interactions avec l'API CoinMarketCap.
 * En production, il ferait des appels API réels via un backend sécurisé.
 * Pour le développement, il peut être configuré pour utiliser un proxy local.
 */

import axios from 'axios';
import { API_CONFIG } from './apiConfig';
import mockCryptoData from './mockCryptoData';

// Créer une instance axios configurée pour l'API CoinMarketCap
const coinMarketCapApi = axios.create({
  baseURL: API_CONFIG.coinMarketCap.baseUrl,
  headers: {
    'Accept': 'application/json'
  }
});

// Ajouter un intercepteur pour ajouter la clé API si nécessaire
coinMarketCapApi.interceptors.request.use(config => {
  // Si nous n'utilisons pas le proxy (qui ajoute la clé automatiquement), ajouter la clé API
  if (config.baseURL === API_CONFIG.coinMarketCap.realBaseUrl) {
    config.headers['X-CMC_PRO_API_KEY'] = API_CONFIG.coinMarketCap.apiKey;
  }
  return config;
});

/**  
 * Récupère les derniers prix pour les crypto-monnaies spécifiées
 * @param {number[]} cryptoIds - Tableau d'IDs de crypto-monnaies
 * @returns {Promise<Object>} - Données de prix formatées
 */
export const getLatestPrices = async (cryptoIds) => {
  try {
    console.log('Fetching real prices for:', cryptoIds);
    
    // Vérifier qu'il y a des IDs à récupérer
    if (!cryptoIds || cryptoIds.length === 0) {
      console.error('No crypto IDs provided to getLatestPrices');
      return {};
    }

    const response = await coinMarketCapApi.get('/cryptocurrency/quotes/latest', {
      params: {
        id: cryptoIds.join(','),
        convert: API_CONFIG.coinMarketCap.defaultCurrency
      }
    });

    console.log('API Response:', response.data);
    
    // Formater les données pour correspondre à notre structure attendue
    const formattedData = {};
    
    Object.entries(response.data.data).forEach(([id, cryptoData]) => {
      formattedData[id] = {
        id: Number(id),
        name: cryptoData.name,
        symbol: cryptoData.symbol,
        price: cryptoData.quote[API_CONFIG.coinMarketCap.defaultCurrency].price,
        percent_change_24h: cryptoData.quote[API_CONFIG.coinMarketCap.defaultCurrency].percent_change_24h,
        percent_change_7d: cryptoData.quote[API_CONFIG.coinMarketCap.defaultCurrency].percent_change_7d,
        percent_change_30d: cryptoData.quote[API_CONFIG.coinMarketCap.defaultCurrency].percent_change_30d,
        market_cap: cryptoData.quote[API_CONFIG.coinMarketCap.defaultCurrency].market_cap,
        volume_24h: cryptoData.quote[API_CONFIG.coinMarketCap.defaultCurrency].volume_24h,
        last_updated: cryptoData.last_updated
      };
    });
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching crypto prices:', error.response ? error.response.data : error.message);
    
    // En cas d'erreur, utiliser les données simulées comme fallback
    console.warn('Falling back to mock data');
    return mockCryptoData.getMockPrices(cryptoIds);
  }
};

/**
 * Récupère les métadonnées des crypto-monnaies
 * @param {number[]} cryptoIds - Tableau d'IDs de crypto-monnaies
 * @returns {Promise<Object>} - Métadonnées
 */
export const getCryptoMetadata = async (cryptoIds) => {
  try {
    if (!cryptoIds || cryptoIds.length === 0) {
      console.error('No crypto IDs provided to getCryptoMetadata');
      return {};
    }

    const response = await coinMarketCapApi.get('/cryptocurrency/info', {
      params: {
        id: cryptoIds.join(',')
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching crypto metadata:', error.response ? error.response.data : error.message);
    
    // Générer des métadonnées simulées simples
    const mockData = {};
    cryptoIds.forEach(id => {
      mockData[id] = {
        id,
        name: `Crypto ${id}`,
        symbol: `C${id}`,
        description: `Description for crypto ${id}`,
        logo: `https://example.com/logo/${id}.png`
      };
    });
    
    return mockData;
  }
};

/**
 * Récupère le classement des crypto-monnaies
 * @param {number} limit - Nombre de crypto-monnaies à récupérer
 * @returns {Promise<Array>} - Liste des crypto-monnaies
 */
export const getTopCryptos = async (limit = 100) => {
  try {
    const response = await coinMarketCapApi.get('/cryptocurrency/listings/latest', {
      params: {
        limit,
        convert: API_CONFIG.coinMarketCap.defaultCurrency
      }
    });
    
    // Formater les données pour correspondre à notre structure attendue
    return response.data.data.map(crypto => ({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      price: crypto.quote[API_CONFIG.coinMarketCap.defaultCurrency].price,
      percent_change_24h: crypto.quote[API_CONFIG.coinMarketCap.defaultCurrency].percent_change_24h,
      percent_change_7d: crypto.quote[API_CONFIG.coinMarketCap.defaultCurrency].percent_change_7d,
      percent_change_30d: crypto.quote[API_CONFIG.coinMarketCap.defaultCurrency].percent_change_30d,
      market_cap: crypto.quote[API_CONFIG.coinMarketCap.defaultCurrency].market_cap,
      volume_24h: crypto.quote[API_CONFIG.coinMarketCap.defaultCurrency].volume_24h,
      circulating_supply: crypto.circulating_supply,
      last_updated: crypto.last_updated
    }));
  } catch (error) {
    console.error('Error fetching top cryptos:', error.response ? error.response.data : error.message);
    
    // En cas d'erreur, utiliser les données simulées comme fallback
    console.warn('Falling back to mock data');
    return mockCryptoData.getMockTopCryptos(limit);
  }
};

/**
 * Récupère les données historiques
 * Note: L'API CoinMarketCap nécessite un plan payant pour les données historiques
 * Cette implémentation est présente pour démontrer l'architecture
 * @param {number} cryptoId - ID de la crypto-monnaie
 * @param {string} timeFrame - Période (1d, 7d, 30d, 90d, 365d)
 * @returns {Promise<Array>} - Données historiques
 */
export const getHistoricalData = async (cryptoId, timeFrame = '30d') => {
  try {
    // Note: Cette API nécessite un plan payant
    // L'implémentation réelle dépendrait de votre abonnement CoinMarketCap
    console.warn('Historical data requires a paid CoinMarketCap plan');
    
    // Utiliser les données simulées comme fallback
    return mockCryptoData.getMockHistoricalData(cryptoId, timeFrame);
  } catch (error) {
    console.error('Error fetching historical data:', error.response ? error.response.data : error.message);
    return mockCryptoData.getMockHistoricalData(cryptoId, timeFrame);
  }
};

/**
 * Récupère les données du marché global
 * @returns {Promise<Object>} - Données de marché globales
 */
export const getGlobalMarketData = async () => {
  try {
    const response = await coinMarketCapApi.get('/global-metrics/quotes/latest', {
      params: {
        convert: API_CONFIG.coinMarketCap.defaultCurrency
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching global market data:', error.response ? error.response.data : error.message);
    
    // En cas d'erreur, utiliser les données simulées comme fallback
    console.warn('Falling back to mock data');
    return mockCryptoData.getMockGlobalMarketData();
  }
};

export default {
  getLatestPrices,
  getCryptoMetadata,
  getTopCryptos,
  getHistoricalData,
  getGlobalMarketData
};