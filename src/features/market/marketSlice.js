// src/features/market/marketSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getCryptoPrices, 
  getTopCryptos as fetchTopCryptos, 
  getHistoricalData,
  getGlobalMarketData as fetchGlobalData
} from '../../services/cryptoApiService';
import { useAppContext } from '../../context/AppContext';

/**
 * État initial du store market
 */
const initialState = {
  prices: {},
  topCryptos: [],
  historicalData: {},
  globalMarketData: null,
  loading: false,
  error: null,
  lastUpdated: null
};

/**
 * Thunk pour récupérer les prix actuels des crypto-monnaies
 */
export const fetchCryptoPrices = createAsyncThunk(
  'market/fetchPrices',
  async (cryptoIds, { rejectWithValue, getState }) => {
    try {
      console.log('Thunk: fetchCryptoPrices for IDs:', cryptoIds);
      
      // Vérifier que cryptoIds est un tableau non vide
      if (!cryptoIds || !Array.isArray(cryptoIds) || cryptoIds.length === 0) {
        console.error('Invalid or empty cryptoIds array:', cryptoIds);
        return rejectWithValue('Invalid cryptoIds parameter');
      }
      
      // Utiliser notre service API abstrait
      const data = await getCryptoPrices(cryptoIds);
      
      // Vérifier si des données ont été renvoyées
      if (!data || Object.keys(data).length === 0) {
        console.error('No data returned from API');
        return rejectWithValue('No data returned from API');
      }
      
      return data;
    } catch (error) {
      console.error('Error in fetchCryptoPrices thunk:', error);
      return rejectWithValue(error.message || 'Failed to fetch prices');
    }
  }
);

/**
 * Thunk pour récupérer le classement des cryptos
 */
export const getTopCryptos = createAsyncThunk(
  'market/fetchTopCryptos',
  async (limit = 100, { rejectWithValue }) => {
    try {
      const data = await fetchTopCryptos(limit);
      
      if (!data || data.length === 0) {
        return rejectWithValue('No data returned for top cryptos');
      }
      
      return data;
    } catch (error) {
      console.error('Error in fetchTopCryptos thunk:', error);
      return rejectWithValue(error.message || 'Failed to fetch top cryptos');
    }
  }
);

/**
 * Thunk pour récupérer les données historiques
 */
export const fetchHistoricalData = createAsyncThunk(
  'market/fetchHistoricalData',
  async ({ cryptoId, timeFrame }, { rejectWithValue }) => {
    try {
      console.log(`Fetching historical data for crypto ${cryptoId}, timeframe ${timeFrame}`);
      
      // Utiliser notre service API abstrait
      const data = await getHistoricalData(cryptoId, timeFrame);
      
      if (!data || data.length === 0) {
        console.error('No historical data returned');
        return rejectWithValue('Failed to fetch historical data');
      }
      
      return { cryptoId, timeFrame, data };
    } catch (error) {
      console.error('Error in fetchHistoricalData thunk:', error);
      return rejectWithValue(error.message || 'Failed to fetch historical data');
    }
  }
);

/**
 * Thunk pour récupérer les données de marché globales
 */
export const fetchGlobalMarketData = createAsyncThunk(
  'market/fetchGlobalMarketData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchGlobalData();
      
      if (!data) {
        return rejectWithValue('No global market data returned');
      }
      
      return data;
    } catch (error) {
      console.error('Error in fetchGlobalMarketData thunk:', error);
      return rejectWithValue(error.message || 'Failed to fetch global market data');
    }
  }
);

/**
 * Slice Redux pour les données de marché
 */
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
      .addCase(getTopCryptos.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTopCryptos.fulfilled, (state, action) => {
        state.loading = false;
        state.topCryptos = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(getTopCryptos.rejected, (state, action) => {
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

// Export du reducer
export default marketSlice.reducer;