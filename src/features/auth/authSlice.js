// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// État initial pour l'authentification
const initialState = {
  user: null,           // Données de l'utilisateur actuel
  isAuthenticated: false, // Statut d'authentification
  token: null,          // Token JWT ou équivalent
  loading: false,       // Indicateur de chargement
  error: null           // Erreurs éventuelles
};

/**
 * Action asynchrone pour se connecter
 * Dans une application réelle, cela ferait une requête à une API d'authentification
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Vérification simplifiée des identifiants (à remplacer par un appel API réel)
      if (credentials.email === 'user@example.com' && credentials.password === 'password') {
        // Simuler une réponse d'API
        const userData = {
          id: 1,
          name: 'Utilisateur Test',
          email: credentials.email,
          avatar: null
        };
        
        // Simuler un token JWT
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYyMDY0OTcyMn0.mock-token';
        
        // Sauvegarder le token dans le localStorage pour la persistance
        localStorage.setItem('token', token);
        
        return { user: userData, token };
      } else {
        return rejectWithValue('Identifiants invalides');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur de connexion');
    }
  }
);

/**
 * Action asynchrone pour se déconnecter
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur de déconnexion');
    }
  }
);

/**
 * Action asynchrone pour vérifier l'authentification au démarrage
 * Vérifie si un token valide existe dans le localStorage
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      // Dans une application réelle, vérifiez la validité du token auprès du serveur
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simuler la récupération des données utilisateur à partir du token
      const userData = {
        id: 1,
        name: 'Utilisateur Test',
        email: 'user@example.com',
        avatar: null
      };
      
      return { user: userData, token };
    } catch (error) {
      // En cas d'erreur, supprimer le token et rejeter
      localStorage.removeItem('token');
      return rejectWithValue(error.message || 'Session expirée');
    }
  }
);

// Création du slice Redux pour l'authentification
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Réinitialiser les erreurs d'authentification
    clearErrors: (state) => {
      state.error = null;
    },
    
    // Mettre à jour les données utilisateur
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Cas pour le login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cas pour le logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cas pour la vérification d'authentification
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        
        // Si des données utilisateur sont renvoyées, l'utilisateur est authentifié
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });
  }
});

// Exportation des actions et du reducer
export const { clearErrors, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;

// Sélecteurs pour faciliter l'accès aux données d'authentification
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;