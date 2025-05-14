// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import DebugPanel from './components/debug/DebugPanel';
import './styles/main.css';
import './styles/dashboard.css';

const App = () => {
    const isDevelopment = import.meta.env.DEV;

  return (
    <Provider store={store}>
      <BrowserRouter>
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

        {/* Ajouter le panneau de débogage uniquement en mode développement */}
        {isDevelopment && <DebugPanel />}

      </BrowserRouter>
    </Provider>
  );
};

export default App;