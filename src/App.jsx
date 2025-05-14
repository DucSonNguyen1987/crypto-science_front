// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
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

  return (
    <Provider store={store}>
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
    </Provider>
  );
};

export default App;