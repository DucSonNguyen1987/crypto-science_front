// src/components/DebugPanel.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCryptoPrices, fetchGlobalMarketData } from '../../features/market/marketSlice';

const DebugPanel = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  
  // Sélectionner les données du store Redux
  const { prices, loading, error, lastUpdated } = useSelector(state => state.market);
  const { assets, transactions } = useSelector(state => state.wallet);
  
  // Formatage des objets pour l'affichage
  const formatObject = (obj) => {
    return JSON.stringify(obj, null, 2);
  };
  
  // Déclencher manuellement les actions Redux
  const handleFetchPrices = () => {
    const cryptoIds = assets.map(asset => asset.id);
    dispatch(fetchCryptoPrices(cryptoIds));
  };
  
  const handleFetchGlobalData = () => {
    dispatch(fetchGlobalMarketData());
  };
  
  const panelStyle = {
    position: 'fixed',
    bottom: isOpen ? '0' : '-90vh',
    right: '0',
    width: '500px',
    height: '90vh',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderLeft: '1px solid #eee',
    borderTop: '1px solid #eee',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
    transition: 'bottom 0.3s ease',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };
  
  const tabStyle = {
    position: 'absolute',
    top: '-30px',
    left: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTop: '1px solid #eee',
    borderLeft: '1px solid #eee',
    borderRight: '1px solid #eee',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    padding: '5px 15px',
    cursor: 'pointer'
  };
  
  const headerStyle = {
    padding: '15px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };
  
  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    padding: '15px'
  };
  
  const sectionStyle = {
    marginBottom: '20px'
  };
  
  const buttonStyle = {
    backgroundColor: '#00D09E',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px'
  };
  
  const preStyle = {
    backgroundColor: '#f5f5f5',
    padding: '10px',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '200px',
    fontSize: '12px'
  };
  
  const getStatusColor = () => {
    if (error) return '#FF7868';
    if (loading) return '#FFE8B3';
    return '#00D09E';
  };
  
  return (
    <div style={panelStyle}>
      <div style={tabStyle} onClick={() => setIsOpen(!isOpen)}>
        Débogage {isOpen ? '▼' : '▲'}
      </div>
      
      <div style={headerStyle}>
        <h3 style={{ margin: 0 }}>Panneau de débogage</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: getStatusColor(), marginRight: '8px' }}></div>
          <span>{loading ? 'Chargement...' : error ? 'Erreur' : 'Prêt'}</span>
        </div>
      </div>
      
      <div style={contentStyle}>
        <div style={sectionStyle}>
          <h4>Actions</h4>
          <button style={buttonStyle} onClick={handleFetchPrices}>Récupérer les prix</button>
          <button style={buttonStyle} onClick={handleFetchGlobalData}>Récupérer les données globales</button>
        </div>
        
        <div style={sectionStyle}>
          <h4>État Redux</h4>
          
          <div>
            <h5>Wallet - Assets ({assets.length})</h5>
            <pre style={preStyle}>{formatObject(assets)}</pre>
          </div>
          
          <div>
            <h5>Market - Prices ({Object.keys(prices).length})</h5>
            <pre style={preStyle}>{formatObject(prices)}</pre>
          </div>
          
          <div>
            <h5>Dernière mise à jour</h5>
            <pre style={preStyle}>{lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Jamais'}</pre>
          </div>
          
          {error && (
            <div>
              <h5>Erreur</h5>
              <pre style={{ ...preStyle, color: 'red' }}>{error}</pre>
            </div>
          )}
        </div>
        
        <div style={sectionStyle}>
          <h4>État de l'application</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Propriété</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Nombre d'actifs</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{assets.length}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Nombre de transactions</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{transactions.length}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Crypto-monnaies chargées</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{Object.keys(prices).length}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Mode de développement</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{import.meta.env.DEV ? 'Oui' : 'Non'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;