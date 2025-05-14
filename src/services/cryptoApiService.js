// src/services/cryptoApiService.js
/**
 * Service d'API abstrait pour les données de crypto-monnaies
 * 
 * Ce service fournit une couche d'abstraction entre l'application et les sources de données.
 * Il peut utiliser soit des données simulées, soit des API réelles, selon la configuration.
 */

import { isMockMode, DATA_MODE } from './apiConfig';
import mockCryptoData from './mockCryptoData';
import coinMarketCapService from './coinMarketCapServices';

/**
 * Détermine quel service utiliser en fonction du mode configuré
 * @param {string} mode - Mode de données (mock ou real)
 * @returns {Object} Service approprié
 */
const getServiceByMode = (mode) => {
  return isMockMode(mode) ? mockCryptoData : coinMarketCapService;
};

/**
 * Récupère les derniers prix pour les crypto-monnaies spécifiées
 * @param {Array} cryptoIds - Liste d'IDs de crypto-monnaies
 * @param {string} mode - Mode à utiliser (mock ou real)
 * @returns {Promise<Object>} Données de prix formatées
 */
export const getCryptoPrices = async (cryptoIds, mode = null) => {
  try {
    const service = getServiceByMode(mode);
    
    // Pour la simulation, utiliser directement la fonction de mock
    if (isMockMode(mode)) {
      return service.getMockPrices(cryptoIds);
    }
    
    // Pour l'API réelle, utiliser la fonction API
    return await service.getLatestPrices(cryptoIds);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    
    // En cas d'erreur avec l'API réelle, fallback sur les données simulées
    if (!isMockMode(mode)) {
      console.warn('Falling back to mock data due to API error');
      return mockCryptoData.getMockPrices(cryptoIds);
    }
    
    throw error;
  }
};

/**
 * Récupère les données historiques pour une crypto-monnaie
 * @param {number} cryptoId - ID de la crypto-monnaie
 * @param {string} timeFrame - Période (1d, 7d, 30d, 90d, 365d)
 * @param {string} mode - Mode à utiliser (mock ou real)
 * @returns {Promise<Array>} Données historiques
 */
export const getHistoricalData = async (cryptoId, timeFrame = '30d', mode = null) => {
  try {
    const service = getServiceByMode(mode);
    
    // Pour la simulation, utiliser directement la fonction de mock
    if (isMockMode(mode)) {
      return service.getMockHistoricalData(cryptoId, timeFrame);
    }
    
    // Pour l'API réelle, utiliser la fonction API
    return await service.getHistoricalData(cryptoId, timeFrame);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    
    // En cas d'erreur avec l'API réelle, fallback sur les données simulées
    if (!isMockMode(mode)) {
      console.warn('Falling back to mock data due to API error');
      return mockCryptoData.getMockHistoricalData(cryptoId, timeFrame);
    }
    
    throw error;
  }
};

/**
 * Récupère les données du marché global
 * @param {string} mode - Mode à utiliser (mock ou real)
 * @returns {Promise<Object>} Données du marché global
 */
export const getGlobalMarketData = async (mode = null) => {
  try {
    const service = getServiceByMode(mode);
    
    // Pour la simulation, utiliser directement la fonction de mock
    if (isMockMode(mode)) {
      return service.getMockGlobalMarketData();
    }
    
    // Pour l'API réelle, utiliser la fonction API
    return await service.getGlobalMarketData();
  } catch (error) {
    console.error('Error fetching global market data:', error);
    
    // En cas d'erreur avec l'API réelle, fallback sur les données simulées
    if (!isMockMode(mode)) {
      console.warn('Falling back to mock data due to API error');
      return mockCryptoData.getMockGlobalMarketData();
    }
    
    throw error;
  }
};

/**
 * Récupère le classement des crypto-monnaies
 * @param {number} limit - Nombre de crypto-monnaies à récupérer
 * @param {string} mode - Mode à utiliser (mock ou real)
 * @returns {Promise<Array>} Liste des crypto-monnaies
 */
export const getTopCryptos = async (limit = 100, mode = null) => {
  try {
    const service = getServiceByMode(mode);
    
    // Pour la simulation, utiliser directement la fonction de mock
    if (isMockMode(mode)) {
      return service.getMockTopCryptos(limit);
    }
    
    // Pour l'API réelle, utiliser la fonction API
    return await service.getTopCryptos(limit);
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    
    // En cas d'erreur avec l'API réelle, fallback sur les données simulées
    if (!isMockMode(mode)) {
      console.warn('Falling back to mock data due to API error');
      return mockCryptoData.getMockTopCryptos(limit);
    }
    
    throw error;
  }
};

export default {
  getCryptoPrices,
  getHistoricalData,
  getGlobalMarketData,
  getTopCryptos
};