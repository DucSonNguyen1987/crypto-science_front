// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from './store';
import { Provider } from 'react-redux';
import { checkAuth } from './features/auth/authSlice';

// Styles globaux d'abord (de moins spécifique à plus spécifique)
import './styles/main.css';         // 1. Styles de base généraux
import './styles/auth.css';         // 2. Styles d'authentification
import './styles/NotFound.css';     // 3. Styles de page non trouvée

// Styles spécifiques aux fonctionnalités ensuite
import './styles/Dashboard.css';    // 4. Dashboard styles 
import './styles/Portfolio.css';    // 5. Portfolio styles
import './styles/Explore.css';      // 6. Explore styles - dernier pour priorité supérieure

// Vérifier l'authentification au démarrage
store.dispatch(checkAuth());

// Rendu de l'application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);