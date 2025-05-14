import { RetweetOutlined } from "@ant-design/icons";
import axios from "axios";

// Configurer l'API CoinMarketCap
const COINMARKET_API_KEY = import.meta.env.VITE_COINMARKETCAP_API_KEY;
const COINMARKETCAP_API_URL = 'https://pro-api.coinmarketcap.com/v1';

// Instance axios configurée
const coinMarketCapApi = axios.create({
    baseURL: COINMARKETCAP_API_URL,
    headers: {
        'X-CMC_PRO_API_KEY': COINMARKET_API_KEY,
        'Accept' : 'application/json',
    }
});

/**  Service pour récupérer les derniers prix pour les cryptos spécifiées
 * @param {number[]} cryptoIds - Tableau d'IDs de crypto-monnaies
 * @returns {Promise<Object>} - Données de prix formatées
*/


export const getLatestPrices = async(cryptoIds) => {
    try {
        const response = await coinMarketCapApi.get('/cryptocurrency/quotes/latest',{
            params : {
                id: cryptoIds.join(','),
                convert: 'EUR'
            }
        });

        return response.data.data;
    } catch (error){
        console.error('Error fetching crypto prices:', error);
        throw error;
    }
};


/**  Service pour récupérer les métadonnées des crypto-monnaies 
 * @param {number[]} cryptoIds - Tableau d'IDs de crypto-monnaies
 * @returns {Promise<Object>} - Métadonnées des crypto-monnaies
*/


export const getCryptoMetadata = async (cryptoIds) => {
    try{
        const response = await coinMarketCapApi.get('/cryptocurrency/info', {
            params : {
                id : cryptoIds.join(',')
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching crypto metadata:', error);
        throw error;
    }
};

// Service pour récupérer le classement des cryptos
export const getTopCryptos = async (limit =100) => {
    try {
        const response = await coinMarketCapApi.get('/cryptocurrency/listings/latest', {
            params : {
                limit,
                convert : 'EUR'
            }
        });
        return response.data.data;
    } catch (error){
        console.error('Error fetching top cryptos:', error);
        throw error;
    }
};

/** Récupère les données historiques pour une crypto
 * Note: L'API gratuite de CoinMarketCap ne fournit pas de données historiques.
 * Cette fonction doit être remplacée par un appel à une API qui les fournit (ex: CoinGecko).
 * @param {number} cryptoId - ID de la crypto-monnaie
 * @param {string} timeFrame - Période (1d, 7d, 30d, 90d, 365d)
 */

export const getHistoricalData = async (cryptoId, timeFrame = '30d') => {
  // Dans une application réelle, utilisez une API qui fournit des données historiques
  // comme CoinGecko, CryptoCompare, ou l'API premium de CoinMarketCap
  try {
    // Ceci est un exemple d'implémentation qui devrait être remplacée
    // par un appel à une vraie API fournissant des données historiques
    // 
    // const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`, {
    //   params: {
    //     vs_currency: 'eur',
    //     days: timeFrame,
    //   }
    // });
    // return response.data;
    
    // Pour l'instant, on renvoie un message d'erreur indiquant que la fonction n'est pas implémentée
    throw new Error('Fonction non implémentée - Dans une application réelle, utilisez une API comme CoinGecko qui fournit des données historiques');
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

/**
 * Récupère les données de marché globales
 * @returns {Promise<Object>} - Données de marché globales
 */
export const getGlobalMarketData = async () => {
  try {
    const response = await coinMarketCapApi.get('/global-metrics/quotes/latest', {
      params: {
        convert: 'EUR'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching global market data:', error);
    throw error;
  }
};

/**
 * Recherche des crypto-monnaies par nom ou symbole
 * @param {string} query - Terme de recherche
 * @param {number} limit - Nombre maximum de résultats
 * @returns {Promise<Object>} - Résultats de recherche
 */
export const searchCryptos = async (query, limit = 10) => {
  try {
    const response = await coinMarketCapApi.get('/cryptocurrency/map', {
      params: {
        symbol: query,
        limit
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error searching cryptos:', error);
    throw error;
  }
};

export default {
  getLatestPrices,
  getCryptoMetadata,
  getTopCryptos,
  getHistoricalData,
  getGlobalMarketData,
  searchCryptos
};
