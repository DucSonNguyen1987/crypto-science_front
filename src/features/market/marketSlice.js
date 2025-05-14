import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getTopCryptos as apiGetTopCryptos,
  getCryptoPrices, 
  getHistoricalData as apiGetHistoricalData,
  getGlobalMarketData as apiGetGlobalMarketData
} from '../../services/cryptoApiService';

/**
 * État initial du store market avec des valeurs par défaut sécurisées
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
  async (cryptoIds, { rejectWithValue }) => {
    try {
      console.log('Thunk: fetchCryptoPrices for IDs:', cryptoIds);
      
      // Validation des entrées
      if (!cryptoIds || !Array.isArray(cryptoIds) || cryptoIds.length === 0) {
        return rejectWithValue('Liste vide ou invalide de crypto-monnaies');
      }
      
      // Appel au service
      const data = await getCryptoPrices(cryptoIds);
      
      // Validation des sorties
      if (!data || Object.keys(data).length === 0) {
        return rejectWithValue('Aucune donnée reçue du service');
      }
      
      console.log('Prices fetched:', Object.keys(data).length);
      return data;
    } catch (error) {
      console.error('Error in fetchCryptoPrices thunk:', error);
      return rejectWithValue(error.message || 'Erreur lors de la récupération des prix');
    }
  }
);

/**
 * Thunk pour récupérer le classement des cryptos
 */
export const getTopCryptos = createAsyncThunk(
  'market/getTopCryptos',
  async (limit = 100, { rejectWithValue }) => {
    try {
      console.log(`Thunk: getTopCryptos with limit ${limit}`);
      
      // Force le mode démo si nécessaire pour le développement
      const forceMode = 'mock'; // Utilisez 'mock' pour forcer les données simulées
      const data = await apiGetTopCryptos(limit, forceMode);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('No data or empty array returned for top cryptos');
        return rejectWithValue('Aucune donnée reçue pour les top cryptos');
      }
      
      console.log(`Received ${data.length} top cryptos`);
      return data;
    } catch (error) {
      console.error('Error in getTopCryptos thunk:', error);
      return rejectWithValue(error.message || 'Erreur lors de la récupération des top cryptos');
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
      
      const data = await apiGetHistoricalData(cryptoId, timeFrame);
      
      if (!data || data.length === 0) {
        console.error('No historical data returned');
        return rejectWithValue('Échec de récupération des données historiques');
      }
      
      return { cryptoId, timeFrame, data };
    } catch (error) {
      console.error('Error in fetchHistoricalData thunk:', error);
      return rejectWithValue(error.message || 'Erreur lors de la récupération des données historiques');
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
      const data = await apiGetGlobalMarketData();
      
      if (!data) {
        return rejectWithValue('Aucune donnée de marché globale reçue');
      }
      
      return data;
    } catch (error) {
      console.error('Error in fetchGlobalMarketData thunk:', error);
      return rejectWithValue(error.message || 'Erreur lors de la récupération des données de marché globales');
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
    },
    
    // Action pour forcer l'initialisation avec des données de démo (pour le développement)
    initializeWithMockData: (state) => {
      // Cette action sera traitée par le middleware
      console.log('Action de réinitialisation avec données simulées déclenchée');
    }
  },
  extraReducers: (builder) => {
    builder
      // Cas fetchCryptoPrices
      .addCase(fetchCryptoPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptoPrices.fulfilled, (state, action) => {
        state.loading = false;
        // Fusionner les nouveaux prix avec les existants
        state.prices = { ...state.prices, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCryptoPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })
      
      // Cas getTopCryptos
      .addCase(getTopCryptos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopCryptos.fulfilled, (state, action) => {
        state.loading = false;
        
        // Vérifier que nous avons bien reçu un tableau
        if (Array.isArray(action.payload)) {
          state.topCryptos = action.payload;
          state.lastUpdated = new Date().toISOString();
          
          // Mettre à jour également les prix pour ces cryptos
          const pricesObj = {};
          action.payload.forEach(crypto => {
            // Ne prendre que les valeurs nécessaires pour l'objet prices
            if (crypto && crypto.id) {
              pricesObj[crypto.id] = {
                id: crypto.id,
                name: crypto.name,
                symbol: crypto.symbol,
                price: crypto.price,
                percent_change_24h: crypto.percent_change_24h,
                percent_change_7d: crypto.percent_change_7d,
                percent_change_30d: crypto.percent_change_30d,
                market_cap: crypto.market_cap,
                volume_24h: crypto.volume_24h,
                last_updated: crypto.last_updated || new Date().toISOString()
              };
            }
          });
          
          // Mettre à jour l'objet prices avec les nouvelles données
          if (Object.keys(pricesObj).length > 0) {
            state.prices = { ...state.prices, ...pricesObj };
          }
        } else {
          console.error('getTopCryptos fulfilled with non-array payload:', action.payload);
          state.error = 'Format de données inattendu reçu du serveur';
        }
      })
      .addCase(getTopCryptos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur lors de la récupération des données';
      })
      
      // Cas fetchHistoricalData
      .addCase(fetchHistoricalData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        state.loading = false;
        
        // Vérifier que les données nécessaires sont présentes
        if (action.payload && action.payload.cryptoId && action.payload.timeFrame && action.payload.data) {
          const { cryptoId, timeFrame, data } = action.payload;
          
          // Initialiser l'objet si nécessaire
          if (!state.historicalData[cryptoId]) {
            state.historicalData[cryptoId] = {};
          }
          
          state.historicalData[cryptoId][timeFrame] = data;
        } else {
          console.error('Incomplete payload in fetchHistoricalData.fulfilled:', action.payload);
        }
      })
      .addCase(fetchHistoricalData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur lors de la récupération des données historiques';
      })
      
      // Cas fetchGlobalMarketData
      .addCase(fetchGlobalMarketData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalMarketData.fulfilled, (state, action) => {
        state.loading = false;
        state.globalMarketData = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchGlobalMarketData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur lors de la récupération des données de marché globales';
      });
  }
});

// Export des actions régulières
export const { 
  updatePrices, 
  clearHistoricalData, 
  clearErrors,
  initializeWithMockData 
} = marketSlice.actions;

// Sélecteurs améliorés pour accéder aux données
export const selectPriceById = (state, cryptoId) => state.market.prices[cryptoId] || null;
export const selectTopCryptos = (state) => state.market.topCryptos || [];
export const selectHistoricalData = (state, cryptoId, timeFrame) => 
  state.market.historicalData[cryptoId]?.[timeFrame] || [];
export const selectGlobalMarketData = (state) => state.market.globalMarketData;
export const selectMarketLoading = (state) => state.market.loading;
export const selectMarketError = (state) => state.market.error;

// Export du reducer
export default marketSlice.reducer;