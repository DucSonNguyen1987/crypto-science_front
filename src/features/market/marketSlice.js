// src/features/market/marketSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getLatestPrices, 
  getTopCryptos, 
  getHistoricalData as fetchHistoricalFromAPI,
  getGlobalMarketData
} from '../../services/coinMarketCapServices.js';

const initialState = {
  prices: {},
  topCryptos: [],
  historicalData: {},
  globalMarketData: null,
  loading: false,
  error: null,
  lastUpdated: null
};

// Thunks pour les appels API

// Récupérer les prix actuels des crypto-monnaies
export const fetchCryptoPrices = createAsyncThunk(
  'market/fetchPrices',
  async (cryptoIds, { rejectWithValue }) => {
    try {
      console.log('Thunk: fetchCryptoPrices for IDs:', cryptoIds);
      
      // Vérifier que cryptoIds est un tableau non vide
      if (!cryptoIds || !Array.isArray(cryptoIds) || cryptoIds.length === 0) {
        console.error('Invalid or empty cryptoIds array:', cryptoIds);
        return rejectWithValue('Invalid cryptoIds parameter');
      }
      
      const data = await getLatestPrices(cryptoIds);
      
      // Vérifier si des données ont été renvoyées
      if (!data || Object.keys(data).length === 0) {
        console.error('No data returned from API');
        // Au lieu de rejeter avec une erreur, utilisons des données fictives
        return generateMockPriceData(cryptoIds);
      }
      
      const formattedData = {};
      
      Object.entries(data).forEach(([id, cryptoData]) => {
        formattedData[id] = {
          id: Number(id),
          name: cryptoData.name,
          symbol: cryptoData.symbol,
          price: cryptoData.quote.EUR.price,
          percent_change_24h: cryptoData.quote.EUR.percent_change_24h,
          percent_change_7d: cryptoData.quote.EUR.percent_change_7d,
          percent_change_30d: cryptoData.quote.EUR.percent_change_30d,
          market_cap: cryptoData.quote.EUR.market_cap,
          volume_24h: cryptoData.quote.EUR.volume_24h,
          last_updated: cryptoData.quote.EUR.last_updated
        };
      });
      
      console.log('Formatted data:', formattedData);
      return formattedData;
    } catch (error) {
      console.error('Error in fetchCryptoPrices thunk:', error);
      // En cas d'erreur, générer des données fictives
      return generateMockPriceData(cryptoIds);
    }
  }
);

// Fonction pour générer des données fictives des prix (pour le développement et en cas d'erreur API)
const generateMockPriceData = (cryptoIds) => {
  console.log('Generating mock price data for:', cryptoIds);
  
  const mockCryptoData = {
    1: { name: 'Bitcoin', symbol: 'BTC', price: 42000, percent_change_24h: 2.5 },
    1027: { name: 'Ethereum', symbol: 'ETH', price: 2800, percent_change_24h: 1.8 },
    5426: { name: 'Solana', symbol: 'SOL', price: 120, percent_change_24h: 3.2 },
    2: { name: 'Litecoin', symbol: 'LTC', price: 150, percent_change_24h: -0.5 },
    825: { name: 'Tether', symbol: 'USDT', price: 0.92, percent_change_24h: 0.1 },
    1839: { name: 'Binance Coin', symbol: 'BNB', price: 380, percent_change_24h: 1.2 },
    52: { name: 'XRP', symbol: 'XRP', price: 0.55, percent_change_24h: -1.3 },
    3408: { name: 'USD Coin', symbol: 'USDC', price: 0.91, percent_change_24h: 0.2 },
    74: { name: 'Dogecoin', symbol: 'DOGE', price: 0.12, percent_change_24h: 5.7 },
    6636: { name: 'Polkadot', symbol: 'DOT', price: 18, percent_change_24h: 2.1 }
  };
  
  const formattedData = {};
  
  cryptoIds.forEach(id => {
    const idStr = id.toString();
    const mockData = mockCryptoData[idStr] || { 
      name: `Crypto ${idStr}`, 
      symbol: `CRP${idStr}`, 
      price: Math.random() * 1000, 
      percent_change_24h: (Math.random() * 10) - 5 
    };
    
    formattedData[idStr] = {
      id: Number(idStr),
      name: mockData.name,
      symbol: mockData.symbol,
      price: mockData.price,
      percent_change_24h: mockData.percent_change_24h,
      percent_change_7d: mockData.percent_change_24h * 1.5,
      percent_change_30d: mockData.percent_change_24h * 3,
      market_cap: mockData.price * 1000000,
      volume_24h: mockData.price * 100000,
      last_updated: new Date().toISOString()
    };
  });
  
  console.log('Generated mock data:', formattedData);
  return formattedData;
};

// Récupérer le classement des crypto-monnaies
export const fetchTopCryptos = createAsyncThunk(
  'market/fetchTopCryptos',
  async (limit = 100, { rejectWithValue }) => {
    try {
      const data = await getTopCryptos(limit);
      
      if (!data || data.length === 0) {
        // Générer des données fictives si l'API ne répond pas
        return generateMockTopCryptos(limit);
      }
      
      return data.map((crypto) => ({
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        price: crypto.quote.EUR.price,
        percent_change_24h: crypto.quote.EUR.percent_change_24h,
        percent_change_7d: crypto.quote.EUR.percent_change_7d,
        percent_change_30d: crypto.quote.EUR.percent_change_30d,
        market_cap: crypto.quote.EUR.market_cap,
        volume_24h: crypto.quote.EUR.volume_24h,
        circulating_supply: crypto.circulating_supply,
        last_updated: crypto.quote.EUR.last_updated
      }));
    } catch (error) {
      console.error('Error in fetchTopCryptos thunk:', error);
      return generateMockTopCryptos(limit);
    }
  }
);

// Fonction pour générer des données fictives du top des cryptos
const generateMockTopCryptos = (limit = 100) => {
  console.log(`Generating mock top ${limit} cryptos`);
  
  const mockCryptos = [];
  const baseNames = ['Bitcoin', 'Ethereum', 'Solana', 'Litecoin', 'Tether', 'Binance Coin', 
                     'XRP', 'USD Coin', 'Dogecoin', 'Polkadot', 'Cardano', 'Avalanche', 
                     'Chainlink', 'Polygon', 'Stellar', 'VeChain', 'Cosmos', 'Tron'];
  
  for (let i = 0; i < Math.min(limit, 100); i++) {
    const name = i < baseNames.length ? baseNames[i] : `Crypto ${i+1}`;
    const symbol = i < baseNames.length ? name.substring(0, 3).toUpperCase() : `C${i+1}`;
    const price = Math.pow(10, 5 - Math.log10(i+1)) * (Math.random() + 0.5);
    
    mockCryptos.push({
      id: i+1,
      name,
      symbol,
      price,
      percent_change_24h: (Math.random() * 10) - 3,
      percent_change_7d: (Math.random() * 20) - 8,
      percent_change_30d: (Math.random() * 40) - 15,
      market_cap: price * (10000000 / (i+1)),
      volume_24h: price * (1000000 / (i+1)),
      circulating_supply: 10000000 * (i+1),
      last_updated: new Date().toISOString()
    });
  }
  
  return mockCryptos;
};

// Récupérer les données historiques
export const fetchHistoricalData = createAsyncThunk(
  'market/fetchHistoricalData',
  async ({ cryptoId, timeFrame }, { rejectWithValue }) => {
    try {
      console.log(`Fetching historical data for crypto ${cryptoId}, timeframe ${timeFrame}`);
      
      // Utiliser notre fonction améliorée pour récupérer des données historiques (simulées)
      const data = await fetchHistoricalFromAPI(cryptoId, timeFrame);
      
      if (!data || data.length === 0) {
        console.error('No historical data returned');
        return rejectWithValue('Failed to fetch historical data');
      }
      
      return { cryptoId, timeFrame, data };
    } catch (error) {
      console.error('Error in fetchHistoricalData thunk:', error);
      return rejectWithValue(error.message || 'Erreur lors de la récupération des données historiques');
    }
  }
);

// Récupérer les données de marché globales
export const fetchGlobalMarketData = createAsyncThunk(
  'market/fetchGlobalMarketData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getGlobalMarketData();
      
      if (!data) {
        // Générer des données fictives
        return {
          total_cryptocurrency: 10000,
          active_cryptocurrencies: 5000,
          total_exchanges: 500,
          quote: {
            EUR: {
              total_market_cap: 1500000000000,
              total_volume_24h: 80000000000,
              btc_dominance: 45.5,
              eth_dominance: 18.3,
              market_cap_change_24h: 2.1
            }
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error in fetchGlobalMarketData thunk:', error);
      return rejectWithValue(error.message || 'Erreur lors de la récupération des données de marché globales');
    }
  }
);

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    // Mettre à jour les prix localement si nécessaire
    updatePrices: (state, action) => {
      state.prices = { ...state.prices, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    
    // Réinitialiser les données historiques
    clearHistoricalData: (state) => {
      state.historicalData = {};
    },
    
    // Réinitialiser l'état des erreurs
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchCryptoPrices cases
      .addCase(fetchCryptoPrices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCryptoPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.prices = { ...state.prices, ...action.payload };
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchCryptoPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchTopCryptos cases
      .addCase(fetchTopCryptos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopCryptos.fulfilled, (state, action) => {
        state.loading = false;
        state.topCryptos = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchTopCryptos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchHistoricalData cases
      .addCase(fetchHistoricalData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        const { cryptoId, timeFrame, data } = action.payload;
        
        // Initialiser la structure si nécessaire
        if (!state.historicalData[cryptoId]) {
          state.historicalData[cryptoId] = {};
        }
        
        state.historicalData[cryptoId][timeFrame] = data;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchHistoricalData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchGlobalMarketData cases
      .addCase(fetchGlobalMarketData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGlobalMarketData.fulfilled, (state, action) => {
        state.loading = false;
        state.globalMarketData = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchGlobalMarketData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions régulières
export const { updatePrices, clearHistoricalData, clearErrors } = marketSlice.actions;

// Sélecteurs pour accéder facilement aux données
export const selectPriceById = (state, cryptoId) => state.market.prices[cryptoId];
export const selectTopCryptos = (state) => state.market.topCryptos;
export const selectHistoricalData = (state, cryptoId, timeFrame) => 
  state.market.historicalData[cryptoId]?.[timeFrame];
export const selectGlobalMarketData = (state) => state.market.globalMarketData;
export const selectMarketLoading = (state) => state.market.loading;
export const selectMarketError = (state) => state.market.error;

// Un seul export default
export default marketSlice.reducer;