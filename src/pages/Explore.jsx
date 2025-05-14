import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getTopCryptos,
  selectTopCryptos,
  selectMarketLoading,
  selectMarketError
} from '../features/market/marketSlice';
import { addToWallet } from '../features/wallet/walletSlice';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiX,
  FiInfo
} from 'react-icons/fi';
import '../styles/Explore.css';

const Explore = () => {
  const dispatch = useDispatch();

  // Sélecteurs Redux avec plus de contrôle
  const topCryptos = useSelector(selectTopCryptos);
  const loading = useSelector(selectMarketLoading);
  const error = useSelector(selectMarketError);
  const { assets } = useSelector((state) => state.wallet);

  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [loadAttempts, setLoadAttempts] = useState(0); // Compteur de tentatives de chargement

  // Chargement initial avec gestion des erreurs améliorée
  useEffect(() => {
    console.log(`Loading top cryptos (attempt ${loadAttempts + 1})`);
    dispatch(getTopCryptos(50)) // Réduire à 50 pour tester plus rapidement
      .then(result => {
        console.log('Top cryptos loading result:', result);
        // Vérifions explicitement que les données sont présentes
        if (!result?.payload || result?.payload.length === 0) {
          console.warn('Empty payload received');
        }
      })
      .catch(err => {
        console.error('Dispatch error:', err);
      });
  }, [dispatch, loadAttempts]); // loadAttempts permettra de relancer le chargement

  // Fonction pour formater les valeurs monétaires
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '€0,00';
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    });
  };

  // Fonction pour filtrer les cryptos selon les critères
  const getFilteredCryptos = () => {
    if (!topCryptos || !Array.isArray(topCryptos)) {
      console.warn('topCryptos is not an array:', topCryptos);
      return [];
    }
    
    // Filtrer par terme de recherche et type
    return topCryptos.filter(crypto => {
      // Vérification des propriétés essentielles
      if (!crypto || !crypto.name || !crypto.symbol) return false;
      
      // Filtre de recherche
      const matchesSearch = !searchTerm || 
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre de type (gainers/losers)
      const matchesType = 
        filterType === 'all' ||
        (filterType === 'gainers' && (crypto.percent_change_24h || 0) > 0) ||
        (filterType === 'losers' && (crypto.percent_change_24h || 0) < 0);
      
      return matchesSearch && matchesType;
    });
  };

  // Calculer les cryptos filtrées
  const filteredCryptos = getFilteredCryptos();

  // Fonction pour rafraîchir explicitement les données
  const handleRefresh = () => {
    setLoadAttempts(prev => prev + 1);
  };

  // Gestion de l'achat d'une crypto
  const handleBuyCrypto = (crypto) => {
    setSelectedCrypto(crypto);
    setBuyAmount('');
    setShowBuyModal(true);
  };

  // Confirmer un achat
  const handleConfirmBuy = () => {
    const parsedAmount = parseFloat(buyAmount);
    if (!selectedCrypto || parsedAmount <= 0) return;
    
    dispatch(addToWallet({
      id: selectedCrypto.id,
      amount: parsedAmount,
      price: selectedCrypto.price || 0
    }));
    
    setShowBuyModal(false);
    alert(`${parsedAmount} ${selectedCrypto.symbol} ajoutés à votre portefeuille!`);
  };

  // Vérifier si une crypto est dans le portefeuille
  const isInPortfolio = (cryptoId) => {
    return assets.some(asset => asset.id === cryptoId);
  };

  // Information de débogage 
  console.log('Explore rendering:', {
    loadingState: loading,
    errorState: error,
    topCryptosCount: topCryptos?.length || 0,
    filteredCryptosCount: filteredCryptos?.length || 0
  });

  return (
    <div className="explore-container">
      <h1 className="explore-title">Explorer les Crypto-monnaies</h1>
      
      {/* Section de recherche et filtres */}
      <div className="explore-controls glass-effect">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher par nom ou symbole..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Toutes
          </button>
          <button
            className={`filter-tab ${filterType === 'gainers' ? 'active' : ''}`}
            onClick={() => setFilterType('gainers')}
          >
            Gainers
          </button>
          <button
            className={`filter-tab ${filterType === 'losers' ? 'active' : ''}`}
            onClick={() => setFilterType('losers')}
          >
            Losers
          </button>

          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spin' : ''} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* État du chargement et affichage des erreurs */}
      {loading && (
        <div className="loading-overlay glass-effect">
          <div className="loading-spinner"></div>
          <span>Chargement des données...</span>
        </div>
      )}

      {error && (
        <div className="error-message glass-effect">
          <p>Une erreur est survenue lors du chargement des données: {error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            Réessayer
          </button>
        </div>
      )}

      {/* Liste des crypto-monnaies (affichage simplifié) */}
      <div className="crypto-list-container glass-effect">
        {!loading && filteredCryptos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiFilter />
            </div>
            <h3 className="empty-state-title">Aucun résultat</h3>
            <p className="empty-state-description">
              {topCryptos?.length ? 
                "Aucune crypto-monnaie ne correspond à vos critères de recherche." :
                "Aucune donnée n'a pu être chargée."
              }
            </p>
            <button className="btn btn-primary" onClick={handleRefresh}>
              Rafraîchir les données
            </button>
          </div>
        ) : (
          <div className="crypto-grid">
            {filteredCryptos.map(crypto => (
              <div className="crypto-card glass-effect" key={crypto.id}>
                <div className="crypto-header">
                  <div className="crypto-name-cell">
                    <div className="crypto-icon">
                      <svg
                        width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: `hsl(${(crypto.id * 137.5) % 360}, 70%, 50%)` }}
                      >
                        <path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="crypto-name">{crypto.name}</h3>
                      <div className="crypto-symbol">{crypto.symbol}</div>
                    </div>
                  </div>
                  <div className={(crypto.percent_change_24h || 0) >= 0 ? 'change-positive' : 'change-negative'}>
                    {(crypto.percent_change_24h || 0) >= 0 ? 
                      <FiTrendingUp className="trend-icon" /> : 
                      <FiTrendingDown className="trend-icon" />
                    }
                    {Math.abs(crypto.percent_change_24h || 0).toFixed(2)}%
                  </div>
                </div>
                <div className="crypto-details">
                  <div className="detail-row">
                    <span className="detail-label">Prix</span>
                    <span className="detail-value">{formatCurrency(crypto.price)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Cap. Marché</span>
                    <span className="detail-value">{formatCurrency(crypto.market_cap)}</span>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => handleBuyCrypto(crypto)}
                >
                  <FiPlus /> {isInPortfolio(crypto.id) ? "Ajouter plus" : "Ajouter au portefeuille"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'achat simplifié */}
      {showBuyModal && selectedCrypto && (
        <div className="modal-overlay" onClick={() => setShowBuyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Acheter {selectedCrypto.name} ({selectedCrypto.symbol})
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowBuyModal(false)}
                aria-label="Fermer"
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="current-price">
                <div className="price-label">Prix actuel</div>
                <div className="price-value">{formatCurrency(selectedCrypto.price)}</div>
              </div>

              <div className="form-group">
                <label htmlFor="buy-amount" className="form-label">
                  Quantité à acheter
                </label>
                <input
                  type="number"
                  id="buy-amount"
                  className="form-control"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
              </div>

              {buyAmount && (
                <div className="estimated-value">
                  <div className="value-label">Valeur estimée</div>
                  <div className="value-amount">
                    {formatCurrency(parseFloat(buyAmount) * (selectedCrypto.price || 0))}
                  </div>
                </div>
              )}

              <div className="info-note">
                <FiInfo className="info-icon" />
                <div>
                  Les crypto-monnaies sont des actifs volatils. N'investissez que ce que vous pouvez vous permettre de perdre.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowBuyModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmBuy}
                disabled={!buyAmount || parseFloat(buyAmount) <= 0}
              >
                Acheter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;