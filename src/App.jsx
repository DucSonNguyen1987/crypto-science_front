// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { AppProvider } from './context/AppContext';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import DemoModeIndicator from './components/demo/DemoModeIndicator';
import DebugPanel from './components/debug/DebugPanel';
import './styles/main.css';

/**
 * Composant principal de l'application
 * Configure le router, les providers et la structure générale
 */
const App = () => {
  const isDevelopment = import.meta.env.DEV;
   const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // Afficher un loading pendant la vérification d'auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(226,246,242,0.7), rgba(241,249,247,0.3))'
      }}>
        <div>Chargement...</div>
      </div>
    );
  }

  // Si pas authentifié, afficher seulement le login
  if (!isAuthenticated) {
    return (
      <AppProvider>
        <BrowserRouter>
          <DemoModeIndicator />
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
          {isDevelopment && <DebugPanel />}
        </BrowserRouter>
      </AppProvider>
    );
  }

  return (
   
      <AppProvider>
        <BrowserRouter>
          {/* Indicateur de mode démo - toujours affiché par défaut */}
          <DemoModeIndicator />
          
          {/* Routes de l'application */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="explore" element={<Explore />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>

          {/* Panneau de débogage uniquement en mode développement */}
          {isDevelopment && <DebugPanel />}
        </BrowserRouter>
      </AppProvider>
   
  );
};

export default App;