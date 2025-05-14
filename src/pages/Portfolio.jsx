// src/pages/Portfolio.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCryptoPrices, 
  fetchHistoricalData 
} from '../features/market/marketSlice';
import { removeFromWallet } from '../features/wallet/walletSlice';
import { 
  FiPieChart, 
  FiBarChart2, 
  FiList, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiTrash2, 
  FiDollarSign,
  FiEdit
} from 'react-icons/fi';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip
} from 'recharts';

import '../styles/Portfolio.css';

const Portfolio = () => {
  const dispatch = useDispatch();
  const { assets } = useSelector((state) => state.wallet);
  const { prices, loading } = useSelector((state) => state.market);
  
  // États locaux
  const [activeView, setActiveView] = useState('list'); // 'list', 'pie', 'allocation'
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellAmount, setSellAmount] = useState('');
  
  // Charger les prix des crypto-monnaies
  useEffect(() => {
    if (assets.length > 0) {
      const cryptoIds = assets.map(asset => asset.id);
      dispatch(fetchCryptoPrices(cryptoIds));
      
      // Mettre à jour les prix toutes les 60 secondes
      const interval = setInterval(() => {
        dispatch(fetchCryptoPrices(cryptoIds));
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [assets, dispatch]);
  
  // Formatage des valeurs monétaires
  const formatCurrency = useCallback((value) => {
    return value.toLocaleString('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 2
    });
  }, []);
  
  // Calculer la valeur totale du portefeuille
  const calculatePortfolioValue = useCallback(() => {
    return assets.reduce((total, asset) => {
      const price = prices[asset.id]?.price || 0;
      return total + (asset.amount * price);
    }, 0);
  }, [assets, prices]);
  
  // Valeur totale du portefeuille
  const portfolioValue = useMemo(() => calculatePortfolioValue(), [calculatePortfolioValue]);
  
  // Calculer la répartition du portefeuille
  const portfolioAllocation = useMemo(() => {
    if (!assets.length || !Object.keys(prices).length) return [];
    
    return assets.map(asset => {
      const price = prices[asset.id] || {};
      const value = asset.amount * (price.price || 0);
      const percentage = (value / portfolioValue) * 100;
      
      return {
        id: asset.id,
        name: price.name || 'Crypto',
        symbol: price.symbol || 'CRYPTO',
        value,
        percentage,
        color: getRandomColor(asset.id) // Fonction pour générer une couleur basée sur l'ID
      };
    }).sort((a, b) => b.value - a.value); // Trier par valeur décroissante
  }, [assets, prices, portfolioValue]);
  
  // Générer une couleur basée sur l'ID
  const getRandomColor = (id) => {
    // Utiliser l'ID comme seed pour générer une couleur cohérente
    const hue = (id * 137.5) % 360; // Multiplier par un nombre premier pour une meilleure distribution
    return `hsl(${hue}, 70%, 50%)`;
  };
  
  // Gérer la vente d'un actif
  const handleSellAsset = (asset) => {
    setSelectedAsset(asset);
    setSellAmount('');
    setShowSellModal(true);
  };
  
  // Confirmer la vente
  const handleConfirmSell = () => {
    const parsedAmount = parseFloat(sellAmount);
    if (selectedAsset && parsedAmount > 0) {
      // Vérifier que le montant n'excède pas la quantité disponible
      if (parsedAmount <= selectedAsset.amount) {
        dispatch(removeFromWallet({
          id: selectedAsset.id,
          amount: parsedAmount,
          price: prices[selectedAsset.id]?.price || 0
        }));
        setShowSellModal(false);
        
        // Afficher une notification de succès (à implémenter)
      }
    }
  };
  
  // Fonction d'aide pour le formatage des pourcentages
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  return (
    <div className="portfolio-container">
      <h1 className="portfolio-title">Mon Portefeuille</h1>
      
      {/* Résumé du portefeuille */}
      <div className="portfolio-summary-card glass-effect">
        <div className="summary-item total-value">
          <span className="summary-label">Valeur totale</span>
          <span className="summary-value">{formatCurrency(portfolioValue)}</span>
        </div>
        <div className="summary-item asset-count">
          <span className="summary-label">Actifs</span>
          <span className="summary-value">{assets.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Rendement 24h</span>
          <span className="summary-value">
            {/* Calculer le rendement sur 24h (simplifié) */}
            <span className="change-positive">+2.14%</span>
          </span>
        </div>
      </div>
      
      {/* Contrôles de vue */}
      <div className="view-controls">
        <button 
          className={`view-control-btn ${activeView === 'list' ? 'active' : ''}`}
          onClick={() => setActiveView('list')}
          aria-label="Vue liste"
        >
          <FiList />
          <span>Liste</span>
        </button>
        <button 
          className={`view-control-btn ${activeView === 'pie' ? 'active' : ''}`}
          onClick={() => setActiveView('pie')}
          aria-label="Vue camembert"
        >
          <FiPieChart />
          <span>Répartition</span>
        </button>
        <button 
          className={`view-control-btn ${activeView === 'allocation' ? 'active' : ''}`}
          onClick={() => setActiveView('allocation')}
          aria-label="Vue allocation"
        >
          <FiBarChart2 />
          <span>Allocation</span>
        </button>
      </div>
      
      {/* Contenu principal basé sur la vue active */}
      <div className="portfolio-content glass-effect">
        {loading && !Object.keys(prices).length ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span>Chargement du portefeuille...</span>
          </div>
        ) : assets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiPieChart />
            </div>
            <h3 className="empty-state-title">Portefeuille vide</h3>
            <p className="empty-state-description">
              Vous n'avez pas encore d'actifs dans votre portefeuille. Commencez par explorer et ajouter des crypto-monnaies.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/explore'}
            >
              Explorer les crypto-monnaies
            </button>
          </div>
        ) : (
          <>
            {/* Vue Liste */}
            {activeView === 'list' && (
              <div className="asset-list">
                <table className="portfolio-table">
                  <thead>
                    <tr>
                      <th>Actif</th>
                      <th>Quantité</th>
                      <th>Prix</th>
                      <th>Valeur</th>
                      <th>24h %</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => {
                      const price = prices[asset.id] || {};
                      const value = asset.amount * (price.price || 0);
                      const change24h = price.percent_change_24h || 0;
                      
                      return (
                        <tr key={asset.id}>
                          <td className="asset-name-cell">
                            <div className="asset-icon">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path 
                                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="asset-name">{price.name || 'Crypto'}</div>
                              <div className="asset-symbol">{price.symbol || 'CRYPTO'}</div>
                            </div>
                          </td>
                          <td>{asset.amount}</td>
                          <td>{formatCurrency(price.price || 0)}</td>
                          <td>{formatCurrency(value)}</td>
                          <td className={change24h >= 0 ? 'change-positive' : 'change-negative'}>
                            {change24h >= 0 ? <FiTrendingUp className="trend-icon" /> : <FiTrendingDown className="trend-icon" />}
                            {Math.abs(change24h).toFixed(2)}%
                          </td>
                          <td className="action-buttons">
                            <button 
                              className="btn-icon btn-action"
                              onClick={() => handleSellAsset(asset)}
                              aria-label={`Vendre ${price.name || 'Crypto'}`}
                            >
                              <FiDollarSign />
                            </button>
                            <button 
                              className="btn-icon btn-action btn-danger"
                              onClick={() => handleSellAsset({...asset, amount: asset.amount})}
                              aria-label={`Supprimer ${price.name || 'Crypto'}`}
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Vue Camembert */}
            {activeView === 'pie' && (
              <div className="pie-chart-view">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={portfolioAllocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {portfolioAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => [formatCurrency(value), 'Valeur']}
                        labelFormatter={(index) => portfolioAllocation[index].name}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="pie-legend">
                  {portfolioAllocation.map((asset) => (
                    <div className="legend-item" key={asset.id}>
                      <div className="legend-color" style={{ backgroundColor: asset.color }}></div>
                      <div className="legend-details">
                        <div className="legend-name">
                          <span>{asset.name}</span>
                          <span className="legend-percentage">{formatPercentage(asset.percentage)}</span>
                        </div>
                        <div className="legend-value">{formatCurrency(asset.value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Vue Allocation */}
            {activeView === 'allocation' && (
              <div className="allocation-view">
                {portfolioAllocation.map((asset) => (
                  <div className="allocation-item" key={asset.id}>
                    <div className="allocation-header">
                      <div className="allocation-name">
                        <div className="asset-icon" style={{ backgroundColor: `${asset.color}20` }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path 
                              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                              stroke={asset.color} 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="asset-name">{asset.name}</div>
                          <div className="asset-symbol">{asset.symbol}</div>
                        </div>
                      </div>
                      <div className="allocation-value">
                        <div className="asset-value">{formatCurrency(asset.value)}</div>
                        <div className="asset-percentage">{formatPercentage(asset.percentage)}</div>
                      </div>
                    </div>
                    <div className="allocation-bar-container">
                      <div 
                        className="allocation-bar"
                        style={{ 
                          width: `${asset.percentage}%`,
                          backgroundColor: asset.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal de vente */}
      {showSellModal && selectedAsset && (
        <div className="modal-overlay" onClick={() => setShowSellModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Vendre {prices[selectedAsset.id]?.name || 'Crypto'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowSellModal(false)}
                aria-label="Fermer"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="asset-info">
                <div className="info-row">
                  <span className="info-label">Prix actuel</span>
                  <span className="info-value">
                    {formatCurrency(prices[selectedAsset.id]?.price || 0)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Quantité détenue</span>
                  <span className="info-value">
                    {selectedAsset.amount} {prices[selectedAsset.id]?.symbol || 'CRYPTO'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Valeur totale</span>
                  <span className="info-value">
                    {formatCurrency(selectedAsset.amount * (prices[selectedAsset.id]?.price || 0))}
                  </span>
                </div>
              </div>
              
              <div className="form-group amount-group">
                <label htmlFor="sell-amount" className="form-label">
                  Quantité à vendre
                </label>
                <div className="input-with-actions">
                  <input 
                    type="number" 
                    id="sell-amount"
                    className="form-control"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    placeholder="Saisir la quantité..."
                    min="0"
                    max={selectedAsset.amount}
                    step="any"
                    autoFocus
                  />
                  <div className="input-actions">
                    <button 
                      className="action-btn"
                      onClick={() => setSellAmount((selectedAsset.amount / 4).toString())}
                    >
                      25%
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => setSellAmount((selectedAsset.amount / 2).toString())}
                    >
                      50%
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => setSellAmount(selectedAsset.amount.toString())}
                    >
                      100%
                    </button>
                  </div>
                </div>
              </div>
              
              {sellAmount && (
                <div className="sell-summary">
                  <div className="summary-row">
                    <span className="summary-label">Quantité à vendre</span>
                    <span className="summary-value">
                      {parseFloat(sellAmount)} {prices[selectedAsset.id]?.symbol || 'CRYPTO'}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Valeur estimée</span>
                    <span className="summary-value highlight">
                      {formatCurrency(parseFloat(sellAmount) * (prices[selectedAsset.id]?.price || 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowSellModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleConfirmSell}
                disabled={!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > selectedAsset.amount}
              >
                Vendre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;