// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from './store';
import { Provider } from 'react-redux';
import { checkAuth } from './features/auth/authSlice';

// Styles globaux
import './styles/main.css';
import './styles/Dashboard.css';
import './styles/Explore.css';
import './styles/Portfolio.css';
import './styles/auth.css';
import './styles/Notfound.css';

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