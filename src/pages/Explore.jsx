// src/pages/Explore.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getTopCryptos,
  fetchCryptoPrices,
  selectTopCryptos,
  selectMarketLoading
} from '../features/market/marketSlice';
import { addToWallet } from '../features/wallet/walletSlice';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiBarChart2,
  FiArrowUp,
  FiArrowDown,
  FiX,
  FiInfo,
  FiRefreshCw
} from 'react-icons/fi';
import '../styles/Explore.css';

/**
 * Composant d'exploration des crypto-monnaies
 * Permet de découvrir et d'ajouter de nouvelles crypto-monnaies au portefeuille
 */
const Explore = () => {
  const dispatch = useDispatch();

  // Sélecteurs Redux
  const topCryptos = useSelector(selectTopCryptos);
  const loading = useSelector(selectMarketLoading);
  const { assets } = useSelector((state) => state.wallet);

  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'gainers', 'losers'
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap', direction: 'desc' });
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');

  // Charger les top crypto-monnaies au démarrage
  useEffect(() => {
    // Charger la liste initiale des crypto-monnaies
    dispatch(getTopCryptos(100));

    // Rafraîchir les données périodiquement
    const interval = setInterval(() => {
      // Si nous avons des crypto-monnaies chargées
      if (topCryptos && topCryptos.length > 0) {
        // Extraire les IDs pour mettre à jour les prix
        const cryptoIds = topCryptos.map(crypto => crypto.id);

        // Mettre à jour les prix en temps réel
        dispatch(fetchCryptoPrices(cryptoIds));
      } else {
        // Si nous n'avons pas encore de données, charger la liste
        dispatch(getTopCryptos(100));
      }
    }, 60000); // Mettre à jour toutes les 60 secondes

    return () => clearInterval(interval);
  }, [dispatch, topCryptos]);

  // Formatage des valeurs monétaires
  const formatCurrency = useCallback((value) => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    });
  }, []);

  // Formatage des grands nombres
  const formatLargeNumber = useCallback((num) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)} Md`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)} k`;
    }
    return num.toString();
  }, []);

  // Filtrer et trier les crypto-monnaies
  const getFilteredAndSortedCryptos = useCallback(() => {
    // Filtrer par terme de recherche et type
    let filtered = [...topCryptos];

    if (searchTerm) {
      filtered = filtered.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType === 'gainers') {
      filtered = filtered.filter(crypto => crypto.percent_change_24h > 0);
    } else if (filterType === 'losers') {
      filtered = filtered.filter(crypto => crypto.percent_change_24h < 0);
    }

    // Trier les résultats
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [topCryptos, searchTerm, filterType, sortConfig]);

  //Obtenir les MAJ immédiates des prix
  const handleRefreshPrices = () => {
    if (topCryptos && topCryptos.length > 0) {
      const cryptoIds = topCryptos.map(crypto => crypto.id);
      dispatch(fetchCryptoPrices(cryptoIds));
    }
  };

  // Gérer le changement de tri
  const handleSort = (key) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };

  // Ouvrir le modal d'achat pour une crypto-monnaie
  const handleBuyCrypto = (crypto) => {
    setSelectedCrypto(crypto);
    setBuyAmount('');
    setShowBuyModal(true);
  };

  // Confirmer l'achat
  const handleConfirmBuy = () => {
    const parsedAmount = parseFloat(buyAmount);
    if (selectedCrypto && parsedAmount > 0) {
      dispatch(addToWallet({
        id: selectedCrypto.id,
        amount: parsedAmount,
        price: selectedCrypto.price
      }));

      setShowBuyModal(false);

      // Dans une application réelle, afficher une notification de succès
      alert(`${parsedAmount} ${selectedCrypto.symbol} ajoutés à votre portefeuille!`);
    }
  };

  // Vérifier si une crypto est déjà dans le portefeuille
  const isInPortfolio = (cryptoId) => {
    return assets.some(asset => asset.id === cryptoId);
  };

  // Afficher l'icône de variation selon la tendance
  const TrendIcon = ({ value, className = "" }) => {
    return value >= 0
      ? <FiTrendingUp className={`trend-icon ${className}`} />
      : <FiTrendingDown className={`trend-icon ${className}`} />;
  };

  // Les données filtrées et triées pour l'affichage
  const filteredCryptos = getFilteredAndSortedCryptos();

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

        {/* Filtres par type */}
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
            onClick={handleRefreshPrices}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spin' : ''} />
            Rafraîchir les prix
          </button>
        </div>
      </div>

      {/* Liste des crypto-monnaies */}
      <div className="crypto-table-container glass-effect">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span>Chargement des données...</span>
          </div>
        ) : filteredCryptos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiFilter />
            </div>
            <h3 className="empty-state-title">Aucun résultat</h3>
            <p className="empty-state-description">
              Aucune crypto-monnaie ne correspond à vos critères de recherche.
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <table className="crypto-table">
            <thead>
              <tr>
                <th className="rank-column">#</th>
                <th className="sortable" onClick={() => handleSort('name')}>
                  Nom {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                </th>
                <th className="sortable" onClick={() => handleSort('price')}>
                  Prix {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                </th>
                <th className="sortable" onClick={() => handleSort('percent_change_24h')}>
                  24h % {sortConfig.key === 'percent_change_24h' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                </th>
                <th className="sortable" onClick={() => handleSort('market_cap')}>
                  Cap. Marché {sortConfig.key === 'market_cap' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                </th>
                <th className="sortable" onClick={() => handleSort('volume_24h')}>
                  Volume (24h) {sortConfig.key === 'volume_24h' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCryptos.map((crypto, index) => (
                <tr key={crypto.id}>
                  <td className="rank-column">{index + 1}</td>
                  <td className="crypto-name-cell">
                    <div className="crypto-icon">
                      {/* Utiliser une couleur générée par l'ID pour l'icône */}
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: `hsl(${(crypto.id * 137.5) % 360}, 70%, 50%)` }}
                      >
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
                      <div className="crypto-name">{crypto.name}</div>
                      <div className="crypto-symbol">{crypto.symbol}</div>
                    </div>
                    {isInPortfolio(crypto.id) && <span className="in-portfolio-badge">En portefeuille</span>}
                  </td>
                  <td>{formatCurrency(crypto.price)}</td>
                  <td className={crypto.percent_change_24h >= 0 ? 'change-positive' : 'change-negative'}>
                    <TrendIcon value={crypto.percent_change_24h} />
                    {Math.abs(crypto.percent_change_24h).toFixed(2)}%
                  </td>
                  <td>{formatCurrency(crypto.market_cap)}</td>
                  <td>{formatCurrency(crypto.volume_24h)}</td>
                  <td>
                    <button
                      className="btn-add"
                      onClick={() => handleBuyCrypto(crypto)}
                      title={isInPortfolio(crypto.id) ? "Ajouter plus" : "Ajouter au portefeuille"}
                    >
                      <FiPlus />
                      <span>Ajouter</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Affichage mobile alternatif */}
      <div className="crypto-grid">
        {!loading && filteredCryptos.map(crypto => (
          <div className="crypto-card glass-effect" key={crypto.id}>
            <div className="crypto-header">
              <div className="crypto-name-cell">
                <div className="crypto-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: `hsl(${(crypto.id * 137.5) % 360}, 70%, 50%)` }}
                  >
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
                  <h3 className="crypto-name">{crypto.name}</h3>
                  <div className="crypto-symbol">{crypto.symbol}</div>
                </div>
              </div>
              <div className={crypto.percent_change_24h >= 0 ? 'change-positive' : 'change-negative'}>
                <TrendIcon value={crypto.percent_change_24h} />
                {Math.abs(crypto.percent_change_24h).toFixed(2)}%
              </div>
            </div>
            <div className="crypto-details">
              <div className="detail-row">
                <span className="detail-label">Prix</span>
                <span className="detail-value">{formatCurrency(crypto.price)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cap. Marché</span>
                <span className="detail-value">{formatLargeNumber(crypto.market_cap)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Volume (24h)</span>
                <span className="detail-value">{formatLargeNumber(crypto.volume_24h)}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => handleBuyCrypto(crypto)}
            >
              <FiPlus /> Ajouter au portefeuille
            </button>
          </div>
        ))}
      </div>

      {/* Modal d'achat */}
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
                <div className={`price-change ${selectedCrypto.percent_change_24h >= 0 ? 'change-positive' : 'change-negative'}`}>
                  <TrendIcon value={selectedCrypto.percent_change_24h} className="small" />
                  {Math.abs(selectedCrypto.percent_change_24h).toFixed(2)}% (24h)
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="buy-amount" className="form-label">
                  Quantité à acheter
                </label>
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="buy-amount"
                    className="form-control"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    autoFocus
                  />
                  <span className="input-symbol">{selectedCrypto.symbol}</span>
                </div>
              </div>

              {buyAmount && (
                <div className="estimated-value">
                  <div className="value-label">Valeur estimée</div>
                  <div className="value-amount">{formatCurrency(parseFloat(buyAmount) * selectedCrypto.price)}</div>
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