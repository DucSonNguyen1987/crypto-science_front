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
    // Validation des entrées
    if (!cryptoIds || !Array.isArray(cryptoIds) || cryptoIds.length === 0) {
      console.warn('getCryptoPrices called with invalid cryptoIds:', cryptoIds);
      return {};
    }
    
    console.log(`getCryptoPrices: Fetching prices for ${cryptoIds.length} cryptos in ${mode || 'default'} mode`);
    const service = getServiceByMode(mode);
    
    // Pour la simulation, utiliser directement la fonction de mock
    if (isMockMode(mode)) {
      console.log('Using mock data for prices');
      const mockData = service.getMockPrices(cryptoIds);
      console.log(`Retrieved mock prices for ${Object.keys(mockData).length} cryptos`);
      return mockData;
    }
    
    // Pour l'API réelle, utiliser la fonction API
    console.log('Using real API for prices');
    const apiData = await service.getLatestPrices(cryptoIds);
    console.log(`Retrieved API prices for ${Object.keys(apiData).length} cryptos`);
    return apiData;
  } catch (error) {
    console.error('Error in getCryptoPrices:', error);
    
    // En cas d'erreur avec l'API réelle, fallback sur les données simulées
    if (!isMockMode(mode)) {
      console.warn('Falling back to mock data due to API error');
      return mockCryptoData.getMockPrices(cryptoIds);
    }
    
    // Si même le mock échoue, retourner un objet vide plutôt que de lancer une exception
    console.error('Even mock data failed, returning empty object');
    return {};
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
    console.log(`getTopCryptos: Fetching top ${limit} cryptos in ${mode || 'default'} mode`);
    const service = getServiceByMode(mode);
    
    // Pour la simulation, utiliser directement la fonction de mock
    if (isMockMode(mode)) {
      console.log('Using mock data for top cryptos');
      const mockData = service.getMockTopCryptos(limit);
      if (!mockData || !Array.isArray(mockData)) {
        console.error('Mock data service returned invalid data:', mockData);
        // Générer des données de secours
        return generateFallbackTopCryptos(limit);
      }
      console.log(`Retrieved ${mockData.length} mock top cryptos`);
      return mockData;
    }
    
    // Pour l'API réelle, utiliser la fonction API
    console.log('Using real API for top cryptos');
    const apiData = await service.getTopCryptos(limit);
    if (!apiData || !Array.isArray(apiData)) {
      console.error('API returned invalid data:', apiData);
      // Fallback sur les données simulées
      return mockCryptoData.getMockTopCryptos(limit);
    }
    console.log(`Retrieved ${apiData.length} API top cryptos`);
    return apiData;
  } catch (error) {
    console.error('Error in getTopCryptos:', error);
    
    // En cas d'erreur, fallback sur les données simulées
    console.warn('Falling back to mock data due to error');
    try {
      return mockCryptoData.getMockTopCryptos(limit);
    } catch (mockError) {
      console.error('Even mock data failed:', mockError);
      // Si même le mock échoue, générer des données de secours minimalistes
      return generateFallbackTopCryptos(limit);
    }
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
    console.log(`getHistoricalData: Fetching data for crypto ${cryptoId}, timeframe ${timeFrame} in ${mode || 'default'} mode`);
    const service = getServiceByMode(mode);
    
    // Pour la simulation, utiliser directement la fonction de mock
    if (isMockMode(mode)) {
      console.log('Using mock data for historical data');
      return service.getMockHistoricalData(cryptoId, timeFrame);
    }
    
    // Pour l'API réelle, utiliser la fonction API
    console.log('Using real API for historical data');
    return await service.getHistoricalData(cryptoId, timeFrame);
  } catch (error) {
    console.error('Error in getHistoricalData:', error);
    
    // En cas d'erreur, fallback sur les données simulées
    console.warn('Falling back to mock data due to error');
    return mockCryptoData.getMockHistoricalData(cryptoId, timeFrame);
  }
};

/**
 * Récupère les données du marché global
 * @param {string} mode - Mode à utiliser (mock ou real)
 * @returns {Promise<Object>} Données du marché global
 */
export const getGlobalMarketData = async (mode = null) => {
  try {
    console.log(`getGlobalMarketData: Fetching data in ${mode || 'default'} mode`);
    const service = getServiceByMode(mode);
    
    // Pour la simulation, utiliser directement la fonction de mock
    if (isMockMode(mode)) {
      console.log('Using mock data for global market data');
      return service.getMockGlobalMarketData();
    }
    
    // Pour l'API réelle, utiliser la fonction API
    console.log('Using real API for global market data');
    return await service.getGlobalMarketData();
  } catch (error) {
    console.error('Error in getGlobalMarketData:', error);
    
    // En cas d'erreur, fallback sur les données simulées
    console.warn('Falling back to mock data due to error');
    return mockCryptoData.getMockGlobalMarketData();
  }
};

/**
 * Génère des données de secours très basiques en cas d'échec total
 * @param {number} limit - Nombre d'éléments à générer
 * @returns {Array} Données de secours
 */
const generateFallbackTopCryptos = (limit = 10) => {
  console.log(`Generating fallback data for ${limit} cryptos`);
  const fallbackData = [];
  
  // Liste minimale hardcodée en cas d'urgence
  const basicCryptos = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 50000 },
    { id: 1027, name: 'Ethereum', symbol: 'ETH', price: 3000 },
    { id: 5426, name: 'Solana', symbol: 'SOL', price: 150 },
    { id: 825, name: 'Tether', symbol: 'USDT', price: 1 },
    { id: 1839, name: 'BNB', symbol: 'BNB', price: 300 }
  ];
  
  // Utiliser les données de base et générer le reste si nécessaire
  for (let i = 0; i < Math.min(limit, basicCryptos.length); i++) {
    fallbackData.push({
      ...basicCryptos[i],
      percent_change_24h: Math.random() * 10 - 5,
      market_cap: basicCryptos[i].price * 1000000,
      volume_24h: basicCryptos[i].price * 100000,
      last_updated: new Date().toISOString()
    });
  }
  
  // Générer des données supplémentaires si nécessaire
  for (let i = basicCryptos.length; i < limit; i++) {
    const id = 10000 + i;
    fallbackData.push({
      id: id,
      name: `Crypto ${id}`,
      symbol: `C${id}`.substring(0, 4),
      price: 10 + Math.random() * 990,
      percent_change_24h: Math.random() * 10 - 5,
      market_cap: (10 + Math.random() * 990) * 1000000,
      volume_24h: (10 + Math.random() * 990) * 100000,
      last_updated: new Date().toISOString()
    });
  }
  
  return fallbackData;
};

export default {
  getCryptoPrices,
  getTopCryptos,
  getHistoricalData,
  getGlobalMarketData
};