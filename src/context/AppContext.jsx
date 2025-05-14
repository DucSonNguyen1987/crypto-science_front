// src/context/AppContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { DATA_MODE, API_CONFIG } from '../services/apiConfig';

// Créer le contexte
const AppContext = createContext();

/**
 * Fournisseur de contexte pour l'application
 * Gère les états globaux comme le mode de données, le thème, etc.
 */
export const AppProvider = ({ children }) => {
  // État du mode de données (mock ou real)
  const [dataMode, setDataMode] = useState(() => {
    // Essayer de charger le mode depuis localStorage, sinon utiliser la valeur par défaut
    const savedMode = localStorage.getItem('crypto_data_mode');
    return savedMode || API_CONFIG.defaultMode;
  });
  
  // État du thème (light ou dark)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('crypto_theme');
    return savedTheme || 'light';
  });
  
  // Indicateur de démo activé/désactivé
  const [demoIndicatorVisible, setDemoIndicatorVisible] = useState(true);
  
  // Enregistrer les changements de mode dans localStorage
  useEffect(() => {
    localStorage.setItem('crypto_data_mode', dataMode);
  }, [dataMode]);
  
  // Enregistrer les changements de thème dans localStorage
  useEffect(() => {
    localStorage.setItem('crypto_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  // Fonction pour basculer entre les modes de données
  const toggleDataMode = () => {
    setDataMode(prevMode => 
      prevMode === DATA_MODE.MOCK ? DATA_MODE.REAL : DATA_MODE.MOCK
    );
  };
  
  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // Fonction pour masquer définitivement l'indicateur de démo
  const dismissDemoIndicator = () => {
    setDemoIndicatorVisible(false);
    localStorage.setItem('crypto_demo_dismissed', 'true');
  };
  
  // Vérifier si nous sommes en mode simulé
  const isUsingMockData = dataMode === DATA_MODE.MOCK;
  
  // Valeurs exposées par le contexte
  const value = {
    dataMode,
    setDataMode,
    toggleDataMode,
    isUsingMockData,
    theme,
    setTheme,
    toggleTheme,
    demoIndicatorVisible,
    dismissDemoIndicator
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'application
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;