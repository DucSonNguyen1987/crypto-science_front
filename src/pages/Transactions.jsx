// src/pages/Transactions.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  FiClock, 
  FiFilter, 
  FiDownload, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiSearch,
  FiCalendar,
  FiChevronDown
} from 'react-icons/fi';

import '../styles/Transactions.css';

const Transactions = () => {
  const { transactions } = useSelector((state) => state.wallet);
  const { prices } = useSelector((state) => state.market);
  
  // États locaux
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'buy', 'sell'
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  // Formater une date ISO en format local
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);
  
  // Formater un montant en devise
  const formatCurrency = useCallback((amount) => {
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    });
  }, []);
  
  // Appliquer les filtres et le tri aux transactions
  useEffect(() => {
    let result = [...transactions];
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      result = result.filter(transaction => {
        const crypto = prices[transaction.cryptoId] || {};
        return (
          crypto.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crypto.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Filtrer par type de transaction
    if (typeFilter !== 'all') {
      result = result.filter(transaction => 
        transaction.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }
    
    // Filtrer par plage de dates
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      result = result.filter(transaction => 
        new Date(transaction.date) >= startDate
      );
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      // Ajouter un jour pour inclure la date de fin entière
      endDate.setDate(endDate.getDate() + 1);
      result = result.filter(transaction => 
        new Date(transaction.date) <= endDate
      );
    }
    
    // Trier les résultats
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Traitement spécial pour certaines clés
        if (sortConfig.key === 'cryptoName') {
          aValue = prices[a.cryptoId]?.name || '';
          bValue = prices[b.cryptoId]?.name || '';
        }
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredTransactions(result);
  }, [transactions, searchTerm, typeFilter, dateRange, sortConfig, prices]);
  
  // Gérer le changement de tri
  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'desc' };
    });
  };
  
  // Gérer le téléchargement des transactions (CSV)
  const handleDownloadCSV = () => {
    // En-têtes du CSV
    const headers = ['Date', 'Type', 'Crypto', 'Quantité', 'Prix', 'Valeur totale'];
    
    // Lignes de données
    const rows = filteredTransactions.map(transaction => {
      const crypto = prices[transaction.cryptoId] || {};
      return [
        formatDate(transaction.date),
        transaction.type === 'BUY' ? 'Achat' : 'Vente',
        crypto.name || 'Crypto',
        transaction.amount,
        transaction.price,
        transaction.value
      ];
    });
    
    // Combiner les en-têtes et les lignes
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDateRange({ start: '', end: '' });
    setSortConfig({ key: 'date', direction: 'desc' });
  };
  
  // Obtenir l'icône de tri pour une colonne
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? <FiTrendingUp /> : <FiTrendingDown />;
  };
  
  // Calculer les statistiques des transactions
  const transactionStats = useCallback(() => {
    if (!transactions.length) return { total: 0, buy: 0, sell: 0, volume: 0 };
    
    let buyCount = 0;
    let sellCount = 0;
    let totalVolume = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'BUY') {
        buyCount++;
      } else {
        sellCount++;
      }
      totalVolume += transaction.value;
    });
    
    return {
      total: transactions.length,
      buy: buyCount,
      sell: sellCount,
      volume: totalVolume
    };
  }, [transactions]);
  
  const stats = transactionStats();
  
  return (
    <div className="transactions-container">
      <h1 className="transactions-title">Historique des transactions</h1>
      
      {/* Statistiques des transactions */}
      <div className="transactions-stats glass-effect">
        <div className="stat-item">
          <span className="stat-label">Total des transactions</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Achats</span>
          <span className="stat-value buy">{stats.buy}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ventes</span>
          <span className="stat-value sell">{stats.sell}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Volume total</span>
          <span className="stat-value">{formatCurrency(stats.volume)}</span>
        </div>
      </div>
      
      {/* Filtres et contrôles */}
      <div className="transactions-controls glass-effect">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input 
            type="text"
            className="search-input"
            placeholder="Rechercher une crypto-monnaie..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="controls-actions">
          <button 
            className="btn-icon filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filtres"
          >
            <FiFilter />
            <span>Filtres</span>
            <FiChevronDown className={`chevron ${showFilters ? 'open' : ''}`} />
          </button>
          
          <button 
            className="btn-icon download-btn"
            onClick={handleDownloadCSV}
            aria-label="Télécharger CSV"
            disabled={filteredTransactions.length === 0}
          >
            <FiDownload />
            <span>Exporter</span>
          </button>
        </div>
      </div>
      
      {/* Filtres avancés */}
      {showFilters && (
        <div className="advanced-filters glass-effect">
          <div className="filter-group">
            <label className="filter-label">Type de transaction</label>
            <div className="filter-options">
              <button 
                className={`filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTypeFilter('all')}
              >
                Toutes
              </button>
              <button 
                className={`filter-btn ${typeFilter === 'buy' ? 'active' : ''}`}
                onClick={() => setTypeFilter('buy')}
              >
                Achats
              </button>
              <button 
                className={`filter-btn ${typeFilter === 'sell' ? 'active' : ''}`}
                onClick={() => setTypeFilter('sell')}
              >
                Ventes
              </button>
            </div>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Période</label>
            <div className="date-filters">
              <div className="date-input-container">
                <label>Du</label>
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="date-input"
                />
              </div>
              <div className="date-input-container">
                <label>Au</label>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="date-input"
                />
              </div>
            </div>
          </div>
          
          <div className="filter-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleResetFilters}
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}
      
      {/* Liste des transactions */}
      <div className="transactions-list glass-effect">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiClock />
            </div>
            <h3 className="empty-state-title">Aucune transaction</h3>
            <p className="empty-state-description">
              Vous n'avez pas encore effectué de transactions. Commencez par acheter des crypto-monnaies.
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiFilter />
            </div>
            <h3 className="empty-state-title">Aucun résultat</h3>
            <p className="empty-state-description">
              Aucune transaction ne correspond à vos critères de recherche.
            </p>
            <button 
              className="btn btn-secondary"
              onClick={handleResetFilters}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('date')}>
                    <span>Date</span>
                    {getSortIcon('date')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('type')}>
                    <span>Type</span>
                    {getSortIcon('type')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('cryptoName')}>
                    <span>Crypto</span>
                    {getSortIcon('cryptoName')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('amount')}>
                    <span>Quantité</span>
                    {getSortIcon('amount')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('price')}>
                    <span>Prix</span>
                    {getSortIcon('price')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('value')}>
                    <span>Valeur totale</span>
                    {getSortIcon('value')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
                  const crypto = prices[transaction.cryptoId] || {};
                  return (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>
                        <span className={`transaction-type-badge transaction-type-${transaction.type.toLowerCase()}`}>
                          {transaction.type === 'BUY' ? 'Achat' : 'Vente'}
                        </span>
                      </td>
                      <td className="crypto-name-cell">
                        <div className="crypto-icon small">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                          <div className="crypto-name">{crypto.name || 'Crypto'}</div>
                          <div className="crypto-symbol">{crypto.symbol || 'CRYPTO'}</div>
                        </div>
                      </td>
                      <td>{transaction.amount} {crypto.symbol}</td>
                      <td>{formatCurrency(transaction.price)}</td>
                      <td>{formatCurrency(transaction.value)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;