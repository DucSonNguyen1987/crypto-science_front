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
      const data = await getLatestPrices(cryptoIds);
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
      
      return formattedData;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération des prix');
    }
  }
);

// Récupérer le classement des crypto-monnaies
export const fetchTopCryptos = createAsyncThunk(
  'market/fetchTopCryptos',
  async (limit = 100, { rejectWithValue }) => {
    try {
      const data = await getTopCryptos(limit);
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
      return rejectWithValue(error.message || 'Erreur lors de la récupération du classement');
    }
  }
);

// Récupérer les données historiques
export const fetchHistoricalData = createAsyncThunk(
  'market/fetchHistoricalData',
  async ({ cryptoId, timeFrame }, { rejectWithValue }) => {
    try {
      const data = await fetchHistoricalFromAPI(cryptoId, timeFrame);
      return { cryptoId, data, timeFrame };
    } catch (error) {
      // Si l'API ne fournit pas de données historiques, on utilise des données de simulation
      // Note: dans une app de production, utilisez une API qui fournit des données historiques
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
      return data;
    } catch (error) {
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
        const { cryptoId, data, timeFrame } = action.payload;
        
        // Stocker les données avec une structure qui permet de distinguer les différentes périodes
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