// src/services/coinMarketCapServices.js
import axios from "axios";

// Configurer l'API CoinMarketCap
const COINMARKETCAP_API_KEY = import.meta.env.VITE_COINMARKETCAP_API_KEY;
const COINMARKETCAP_API_URL = 'https://pro-api.coinmarketcap.com/v1';

// Instance axios configurée
const coinMarketCapApi = axios.create({
    baseURL: COINMARKETCAP_API_URL,
    headers: {
        'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
        'Accept': 'application/json',
    }
});

/**  
 * Service pour récupérer les derniers prix pour les cryptos spécifiées
 * @param {number[]} cryptoIds - Tableau d'IDs de crypto-monnaies
 * @returns {Promise<Object>} - Données de prix formatées
 */
export const getLatestPrices = async (cryptoIds) => {
    try {
        console.log('Fetching prices for:', cryptoIds);
        // Vérifier qu'il y a des IDs à récupérer
        if (!cryptoIds || cryptoIds.length === 0) {
            console.error('No crypto IDs provided to getLatestPrices');
            return {};
        }

        const response = await coinMarketCapApi.get('/cryptocurrency/quotes/latest', {
            params: {
                id: cryptoIds.join(','),
                convert: 'EUR'
            }
        });

        console.log('API Response:', response.data);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching crypto prices:', error.response ? error.response.data : error.message);
        // Renvoyer un objet vide plutôt que de propager l'erreur
        return {};
    }
};

/**  
 * Service pour récupérer les métadonnées des crypto-monnaies 
 * @param {number[]} cryptoIds - Tableau d'IDs de crypto-monnaies
 * @returns {Promise<Object>} - Métadonnées des crypto-monnaies
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
        return {};
    }
};

/**
 * Service pour récupérer le classement des cryptos
 * @param {number} limit - Nombre de crypto-monnaies à récupérer
 * @returns {Promise<Array>} - Liste des crypto-monnaies
 */
export const getTopCryptos = async (limit = 100) => {
    try {
        const response = await coinMarketCapApi.get('/cryptocurrency/listings/latest', {
            params: {
                limit,
                convert: 'EUR'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching top cryptos:', error.response ? error.response.data : error.message);
        return [];
    }
};

/** 
 * Génère des données historiques fictives pour une crypto-monnaie
 * Utilisé comme fallback quand l'API ne fournit pas de données historiques
 * @param {number} cryptoId - ID de la crypto-monnaie
 * @param {string} timeFrame - Période (1d, 7d, 30d, 90d, 365d)
 * @returns {Promise<Object>} - Données historiques simulées
 */
export const getHistoricalData = async (cryptoId, timeFrame = '30d') => {
    console.log(`Generating simulated historical data for crypto ${cryptoId}, timeframe ${timeFrame}`);
    
    try {
        // D'abord, récupérer le prix actuel pour avoir une référence
        const currentPriceData = await getLatestPrices([cryptoId]);
        
        if (!currentPriceData || !currentPriceData[cryptoId]) {
            throw new Error('Failed to get current price for simulation');
        }
        
        const currentPrice = currentPriceData[cryptoId].quote.EUR.price;
        const currentDate = new Date();
        
        // Déterminer le nombre de points de données en fonction de la période
        let days;
        switch (timeFrame) {
            case '1d': days = 1; break;
            case '7d': days = 7; break;
            case '30d': days = 30; break;
            case '90d': days = 90; break;
            case '365d': days = 365; break;
            default: days = 30;
        }
        
        // Calculer le pas de temps (en heures)
        const timeStep = timeFrame === '1d' ? 1 : 24; // Points par jour
        const dataPoints = timeFrame === '1d' ? 24 : days;
        
        // Générer des données historiques simulées
        const prices = [];
        let price = currentPrice * 0.85; // Commencer à environ -15% du prix actuel
        
        for (let i = 0; i < dataPoints; i++) {
            const date = new Date(currentDate);
            date.setHours(date.getHours() - (dataPoints - i) * timeStep);
            
            // Simuler une tendance haussière avec une petite variation aléatoire
            const randomFactor = 1 + ((Math.random() * 0.02) - 0.01); // -1% à +1%
            const trendFactor = 1 + (0.15 * (i / dataPoints)); // Tendance haussière progressive
            
            price = price * randomFactor * trendFactor;
            
            prices.push({
                date: date.toISOString(),
                price: price,
                volume: Math.floor(Math.random() * 1000000) + 500000, // Volume simulé
                market_cap: price * (Math.floor(Math.random() * 1000000) + 10000000) // Market cap simulé
            });
        }
        
        return prices;
    } catch (error) {
        console.error('Error generating historical data:', error);
        // Retourner un tableau vide au lieu de propager l'erreur
        return [];
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
        console.error('Error fetching global market data:', error.response ? error.response.data : error.message);
        return null;
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
        console.error('Error searching cryptos:', error.response ? error.response.data : error.message);
        return [];
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