// src/components/DemoModeIndicator.jsx
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiInfo, FiX, FiDatabase, FiServer } from 'react-icons/fi';
import { DATA_MODE } from '../../services/apiConfig';
import '../../styles/DemoModeIndicator.css';

/**
 * Composant d'indication du mode démo
 * Affiche un bandeau d'information sur l'utilisation de données simulées
 */
const DemoModeIndicator = () => {
  const { 
    dataMode, 
    toggleDataMode, 
    demoIndicatorVisible, 
    dismissDemoIndicator 
  } = useAppContext();
  
  // Ne rien afficher si l'indicateur a été masqué
  if (!demoIndicatorVisible) {
    return null;
  }
  
  // Déterminer le message et la couleur en fonction du mode
  const isUsingMockData = dataMode === DATA_MODE.MOCK;
  const bannerClass = isUsingMockData ? 'demo-indicator demo-mode' : 'demo-indicator api-mode';
  
  return (
    <div className={bannerClass}>
      <div className="demo-indicator-content">
        <FiInfo className="demo-indicator-icon" />
        
        <div className="demo-indicator-message">
          <p>
            <strong>
              {isUsingMockData 
                ? 'Mode démo : Données simulées' 
                : 'Mode API : Données réelles'}
            </strong>
            {isUsingMockData 
              ? ' - Cette application utilise des données simulées pour éviter les problèmes CORS.' 
              : ' - L\'application utilise l\'API CoinMarketCap.'}
          </p>
        </div>
        
        <div className="demo-indicator-actions">
          <button 
            className="toggle-mode-btn"
            onClick={toggleDataMode}
            title={isUsingMockData ? 'Passer aux données réelles' : 'Passer aux données simulées'}
          >
            {isUsingMockData 
              ? <><FiServer /> API</> 
              : <><FiDatabase /> Démo</>}
          </button>
          
          <button 
            className="dismiss-btn"
            onClick={dismissDemoIndicator}
            title="Masquer ce message"
          >
            <FiX />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoModeIndicator;