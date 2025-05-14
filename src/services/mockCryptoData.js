// src/services/mockCryptoData.js
/**
 * Service de données simulées pour l'application crypto-wallet
 * 
 * Ce fichier fournit des données simulées réalistes pour le développement
 * et la démonstration de l'application sans nécessiter d'accès API.
 * Les données générées sont déterministes (cohérentes pour les mêmes paramètres)
 * et imitent les tendances réelles du marché des crypto-monnaies.
 */

// Générer des prix cohérents avec de petites variations
const generatePriceWithVariation = (basePrice, date = new Date()) => {
  // Utiliser la date pour générer des variations cohérentes pour le même jour
  const dayFactor = date.getDate() / 31;
  const hourFactor = date.getHours() / 24;
  
  // Créer une variation prévisible mais apparemment aléatoire
  const variation = Math.sin(dayFactor * Math.PI * 2) * 0.05 + 
                   Math.cos(hourFactor * Math.PI * 2) * 0.03;
  
  return basePrice * (1 + variation);
};

// Données de base pour les crypto-monnaies courantes
const cryptoBaseData = {
  1: { 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    basePrice: 42000,
    iconColor: '#F7931A',
    marketCap: 800000000000 
  },
  1027: { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    basePrice: 2800,
    iconColor: '#627EEA',
    marketCap: 340000000000 
  },
  5426: { 
    name: 'Solana', 
    symbol: 'SOL', 
    basePrice: 120,
    iconColor: '#00FFA3',
    marketCap: 48000000000 
  },
  825: { 
    name: 'Tether', 
    symbol: 'USDT', 
    basePrice: 0.92,
    iconColor: '#26A17B',
    marketCap: 83000000000 
  },
  1839: { 
    name: 'Binance Coin', 
    symbol: 'BNB', 
    basePrice: 380,
    iconColor: '#F3BA2F',
    marketCap: 60000000000 
  },
  52: { 
    name: 'XRP', 
    symbol: 'XRP', 
    basePrice: 0.55,
    iconColor: '#23292F',
    marketCap: 29000000000 
  },
  3408: { 
    name: 'USD Coin', 
    symbol: 'USDC', 
    basePrice: 0.91,
    iconColor: '#2775CA',
    marketCap: 43000000000 
  },
  74: { 
    name: 'Dogecoin', 
    symbol: 'DOGE', 
    basePrice: 0.12,
    iconColor: '#C2A633',
    marketCap: 15000000000 
  },
  6636: { 
    name: 'Polkadot', 
    symbol: 'DOT', 
    basePrice: 18,
    iconColor: '#E6007A',
    marketCap: 22000000000 
  },
  2: { 
    name: 'Litecoin', 
    symbol: 'LTC', 
    basePrice: 150,
    iconColor: '#BFBBBB',
    marketCap: 11000000000 
  }
};

/**
 * Génère des données de prix simulées pour les crypto-monnaies spécifiées
 * @param {number[]} cryptoIds - Liste d'IDs de crypto-monnaies
 * @return {Object} Données formatées comme l'API CoinMarketCap
 */
export const getMockPrices = (cryptoIds) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const formattedData = {};
  
  cryptoIds.forEach(id => {
    const idStr = id.toString();
    const baseData = cryptoBaseData[idStr] || { 
      name: `Crypto ${idStr}`, 
      symbol: `C${idStr}`, 
      basePrice: 10 + (id % 1000),
      marketCap: 1000000 * (id % 100)
    };
    
    // Générer le prix actuel avec une légère variation
    const currentPrice = generatePriceWithVariation(baseData.basePrice, now);
    
    // Générer le prix d'hier avec une variation différente
    const yesterdayPrice = generatePriceWithVariation(baseData.basePrice, yesterday);
    
    // Calculer les variations en pourcentage
    const percentChange24h = ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100;
    
    // Générer d'autres pourcentages avec des relations cohérentes
    const percentChange7d = percentChange24h * (1.5 + (Math.sin(id) * 0.5));
    const percentChange30d = percentChange7d * (1.2 + (Math.cos(id) * 0.3));
    
    formattedData[idStr] = {
      id: Number(idStr),
      name: baseData.name,
      symbol: baseData.symbol,
      price: currentPrice,
      iconColor: baseData.iconColor || '#00D09E',
      percent_change_24h: percentChange24h,
      percent_change_7d: percentChange7d,
      percent_change_30d: percentChange30d,
      market_cap: baseData.marketCap || (currentPrice * 1000000),
      volume_24h: currentPrice * 100000 * (1 + Math.sin(id)),
      last_updated: now.toISOString()
    };
  });
  
  return formattedData;
};

/**
 * Génère des données historiques simulées pour une crypto-monnaie
 * @param {number} cryptoId - ID de la crypto-monnaie
 * @param {string} timeFrame - Période (1d, 7d, 30d, 90d, 365d)
 * @return {Array} Points de données historiques
 */
export const getMockHistoricalData = (cryptoId, timeFrame = '30d') => {
  const now = new Date();
  const cryptoBaseInfo = cryptoBaseData[cryptoId] || { 
    basePrice: 100 + (cryptoId % 1000) 
  };
  
  // Déterminer le nombre de points de données et l'intervalle selon la période
  let days;
  let interval;
  
  switch (timeFrame) {
    case '1d':
      days = 1; 
      interval = 1; // Intervalles d'1 heure
      break;
    case '7d':
      days = 7;
      interval = 6; // Intervalles de 6 heures
      break;
    case '30d':
      days = 30;
      interval = 24; // Intervalles d'1 jour
      break;
    case '90d':
      days = 90;
      interval = 24; // Intervalles d'1 jour
      break;
    case '365d':
      days = 365;
      interval = 24 * 7; // Intervalles hebdomadaires
      break;
    default:
      days = 30;
      interval = 24;
  }
  
  // Calculer combien d'heures en arrière nous devons aller
  const totalHours = days * 24;
  
  // Générer une tendance de base pour la période
  // Utilisation d'ondes sinusoïdales avec différentes périodes pour créer des mouvements de prix réalistes
  const trendPoints = [];
  
  // Calculer la tendance de base en utilisant plusieurs ondes sinusoïdales
  for (let hour = 0; hour <= totalHours; hour += interval) {
    const date = new Date(now);
    date.setHours(date.getHours() - hour);
    
    // Temps normalisé de 0 à 1 sur la période
    const normalizedTime = hour / totalHours;
    
    // Créer une tendance différente pour chaque période
    let trendValue;
    
    if (timeFrame === '1d') {
      // Tendance intrajournalière - petits mouvements
      trendValue = Math.sin(normalizedTime * Math.PI * 4) * 0.01 + 
                   Math.sin(normalizedTime * Math.PI * 8) * 0.005;
    } else if (timeFrame === '7d') {
      // Tendance hebdomadaire - mouvements moyens
      trendValue = Math.sin(normalizedTime * Math.PI * 2) * 0.03 + 
                   Math.sin(normalizedTime * Math.PI * 6) * 0.01;
    } else {
      // Tendances mensuelles et plus - mouvements plus importants
      trendValue = Math.sin(normalizedTime * Math.PI * 2) * 0.08 + 
                   Math.sin(normalizedTime * Math.PI * 0.5) * 0.05 +
                   normalizedTime * 0.1; // Ajouter une légère tendance à la hausse
    }
    
    // Ajouter du bruit aléatoire
    const noise = (Math.sin(date.getTime() * cryptoId) * 0.01);
    
    // Calculer le prix à ce point
    const price = cryptoBaseInfo.basePrice * (1 + trendValue + noise);
    
    // Ajouter un volume avec variation
    const volume = cryptoBaseInfo.basePrice * 1000 * (0.8 + Math.sin(normalizedTime * Math.PI * 8) * 0.4);
    
    trendPoints.unshift({
      date: date.toISOString(),
      price,
      volume,
      market_cap: price * (cryptoBaseInfo.marketCap / cryptoBaseInfo.basePrice || 1000000)
    });
  }
  
  return trendPoints;
};

/**
 * Génère des données de marché global simulées
 * @return {Object} Données globales de marché
 */
export const getMockGlobalMarketData = () => {
  const now = new Date();
  
  // Générer une variation quotidienne
  const dayVariation = Math.sin(now.getDate() / 31 * Math.PI * 2) * 0.05;
  
  return {
    total_cryptocurrency: 10000 + Math.floor(Math.random() * 500),
    active_cryptocurrencies: 5000 + Math.floor(Math.random() * 200),
    total_exchanges: 500 + Math.floor(Math.random() * 20),
    quote: {
      EUR: {
        total_market_cap: 1500000000000 * (1 + dayVariation),
        total_volume_24h: 80000000000 * (1 + dayVariation * 2),
        btc_dominance: 45.5 + (Math.sin(now.getTime() / 1000000) * 2),
        eth_dominance: 18.3 + (Math.cos(now.getTime() / 1000000) * 1.5),
        market_cap_change_24h: dayVariation * 100
      }
    }
  };
};

/**
 * Génère une liste simulée des meilleures crypto-monnaies
 * @param {number} limit - Nombre de crypto-monnaies à récupérer
 * @return {Array} Liste des crypto-monnaies
 */
export const getMockTopCryptos = (limit = 100) => {
  const result = [];
  
  // Commencer par nos crypto-monnaies connues
  const knownCryptoIds = Object.keys(cryptoBaseData).map(id => parseInt(id));
  
  // Obtenir les prix pour les crypto-monnaies connues
  const knownCryptoPrices = getMockPrices(knownCryptoIds);
  
  // Ajouter les crypto-monnaies connues aux résultats
  knownCryptoIds.forEach(id => {
    if (result.length < limit) {
      result.push(knownCryptoPrices[id]);
    }
  });
  
  // Remplir les emplacements restants avec des crypto-monnaies aléatoires
  for (let i = result.length; i < limit; i++) {
    const id = 10000 + i;
    const mockPrice = 1 + (Math.random() * 100);
    
    result.push({
      id,
      name: `Crypto ${id}`,
      symbol: `C${id}`.substring(0, 5),
      price: mockPrice,
      percent_change_24h: (Math.random() * 10) - 5,
      percent_change_7d: (Math.random() * 20) - 10,
      percent_change_30d: (Math.random() * 40) - 20,
      market_cap: mockPrice * (1000000 + Math.random() * 10000000),
      volume_24h: mockPrice * (100000 + Math.random() * 1000000),
      circulating_supply: 1000000 + Math.random() * 100000000,
      last_updated: new Date().toISOString()
    });
  }
  
  // Trier par capitalisation boursière (décroissante)
  result.sort((a, b) => b.market_cap - a.market_cap);
  
  return result;
};

export default {
  getMockPrices,
  getMockHistoricalData,
  getMockGlobalMarketData,
  getMockTopCryptos
};