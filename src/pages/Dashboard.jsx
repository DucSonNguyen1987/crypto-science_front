import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCryptoPrices,
    fetchHistoricalData,
    fetchGlobalMarketData
} from '../features/market/marketSlice';
import {
    updatePortfolioChanges,
    addPortfolioHistoryPoint,
    setInitialAssets
} from '../features/wallet/walletSlice';
import {
    FiBriefcase,
    FiBarChart2,
    FiClock,
    FiTrendingUp,
    FiTrendingDown,
    FiRefreshCw,
    FiDollarSign,
    FiActivity
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const dispatch = useDispatch();

    // Sélecteurs Redux
    const { assets, dailyChange, weeklyChange, monthlyChange, transactions } = useSelector((state) => state.wallet);
    const { prices, loading, historicalData, globalMarketData } = useSelector((state) => state.market);

    // État local
    const [activePeriod, setActivePeriod] = useState('7j');
    const [refreshing, setRefreshing] = useState(false);

    // Charger les données initiales au montage du composant
    useEffect(() => {
        // Si aucun actif n'est présent, initialiser avec des données de démo
        if (assets.length === 0) {
            const initialAssets = [
                { id: 1, amount: 0.05 },    // Bitcoin
                { id: 1027, amount: 1.2 },  // Ethereum
                { id: 5426, amount: 12 }    // Solana
            ];

            dispatch(setInitialAssets(initialAssets));
        }

        // Charger les données globales du marché
        dispatch(fetchGlobalMarketData());
    }, [dispatch, assets.length]);

    // Mettre à jour les prix des crypto-monnaies à intervalles réguliers
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

    // Charger les données historiques en fonction de la période active
    useEffect(() => {
        if (assets.length > 0 && Object.keys(prices).length > 0) {
            // Convertir la période active en format adapté pour l'API
            let timeFrame;
            switch (activePeriod) {
                case '24h':
                    timeFrame = '1d';
                    break;
                case '7j':
                    timeFrame = '7d';
                    break;
                case '1m':
                    timeFrame = '30d';
                    break;
                case '1a':
                    timeFrame = '365d';
                    break;
                default:
                    timeFrame = '7d';
            }

            // Charger les données historiques pour chaque actif
            assets.forEach(asset => {
                dispatch(fetchHistoricalData({
                    cryptoId: asset.id,
                    timeFrame
                }));
            });

            // Mettre à jour les données du portefeuille
            const totalValue = calculatePortfolioValue();
            dispatch(addPortfolioHistoryPoint({
                timestamp: new Date().toISOString(),
                totalValue,
                assets
            }));
        }
    }, [activePeriod, assets, prices, dispatch]);

    // Mettre à jour les changements du portefeuille lorsque les prix changent
    useEffect(() => {
        if (Object.keys(prices).length > 0 && assets.length > 0) {
            dispatch(updatePortfolioChanges({
                assets,
                currentPrices: prices,
                // Dans une application réelle, ces données proviendraient de l'API
                // et seraient structurées correctement
                dailyPrices: prices,
                weeklyPrices: prices,
                monthlyPrices: prices
            }));
        }
    }, [prices, assets, dispatch]);

    // Calculer la valeur totale du portefeuille
    const calculatePortfolioValue = useCallback(() => {
        return assets.reduce((total, asset) => {
            const price = prices[asset.id]?.price || 0;
            return total + (asset.amount * price);
        }, 0);
    }, [assets, prices]);

    // Valeur mémorisée du portfolio pour éviter les recalculs inutiles
    const portfolioValue = useMemo(() => calculatePortfolioValue(), [calculatePortfolioValue]);

    // Sélectionner le changement en pourcentage en fonction de la période active
    const getActiveChange = useCallback(() => {
        switch (activePeriod) {
            case '24h':
                return dailyChange;
            case '7j':
                return weeklyChange;
            case '1m':
                return monthlyChange;
            case '1a':
                // Idéalement, nous devrions avoir une valeur annualChange distincte
                return monthlyChange;
            default:
                return weeklyChange;
        }
    }, [activePeriod, dailyChange, weeklyChange, monthlyChange]);

    // Valeur mémorisée du changement de portfolio
    const portfolioChange = useMemo(() => getActiveChange(), [getActiveChange]);

    // Rafraîchir les données
    const handleRefresh = () => {
        setRefreshing(true);

        const cryptoIds = assets.map(asset => asset.id);
        Promise.all([
            dispatch(fetchCryptoPrices(cryptoIds)),
            dispatch(fetchGlobalMarketData())
        ]).then(() => {
            setTimeout(() => setRefreshing(false), 500);
        }).catch(() => {
            setRefreshing(false);
        });
    };

    // Préparation des données pour le graphique
    const prepareChartData = useCallback(() => {
        // Vérifier que nous avons des actifs et des données historiques
        if (!assets.length || Object.keys(historicalData).length === 0) {
            return generateFallbackChartData();
        }

        // Pour transformer les données historiques en données de portefeuille combinées,
        // nous devons d'abord créer une structure temporelle unifiée
        const timeMap = new Map();
        let hasAnyData = false;

        // Parcourir tous les actifs
        assets.forEach(asset => {
            const timeFrameKey = activePeriod === '24h' ? '1d' :
                activePeriod === '7j' ? '7d' :
                    activePeriod === '1m' ? '30d' : '365d';

            const assetData = historicalData[asset.id]?.[timeFrameKey];

            // Si nous n'avons pas de données pour cet actif, passer au suivant
            if (!assetData || !assetData.length) return;

            hasAnyData = true;

            // Pour chaque point de données de l'actif
            assetData.forEach(dataPoint => {
                const date = dataPoint.date; // La date devrait être un format standard
                const value = dataPoint.price * asset.amount; // La valeur de cet actif à cette date

                // Si cette date existe déjà dans notre map, ajouter la valeur
                if (timeMap.has(date)) {
                    timeMap.set(date, timeMap.get(date) + value);
                } else {
                    // Sinon, initialiser avec cette valeur
                    timeMap.set(date, value);
                }
            });
        });

        // Si nous n'avons aucune donnée, retourner des données factices
        if (!hasAnyData) {
            return generateFallbackChartData();
        }

        // Transformer la map en un tableau de points de données trié par date
        const chartData = Array.from(timeMap.entries())
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return chartData;
    }, [assets, historicalData, activePeriod, portfolioValue]);

    // Fonction pour générer des données factices en cas d'absence de données historiques
    const generateFallbackChartData = useCallback(() => {
        const days = activePeriod === '24h' ? 24 :
            activePeriod === '7j' ? 7 :
                activePeriod === '1m' ? 30 : 365;

        const data = [];
        const now = new Date();
        let value = portfolioValue * 0.85; // Commencer à environ -15% de la valeur actuelle

        for (let i = days; i >= 0; i--) {
            const date = new Date(now);

            if (activePeriod === '24h') {
                date.setHours(date.getHours() - i);
            } else {
                date.setDate(date.getDate() - i);
            }

            // Simuler une tendance haussière avec une petite variation aléatoire
            const randomFactor = 1 + ((Math.random() * 0.02) - 0.01); // -1% à +1%
            const trendFactor = 1 + (0.15 * (i / days)); // Tendance haussière progressive

            value = value * randomFactor * trendFactor;

            data.push({
                date: activePeriod === '24h' ?
                    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) :
                    date.toLocaleDateString('fr-FR'),
                value: value
            });
        }

        return data;
    }, [activePeriod, portfolioValue]);

    // Mémoriser les données du graphique pour éviter les recalculs inutiles
    const chartData = useMemo(() => prepareChartData(), [prepareChartData]);

    // Formater le montant pour l'affichage
    const formatCurrency = (amount) => {
        return amount.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 2
        });
    };

    return (
        <div className='dashboard-container'>

            <div className='dashboard-header'>
                <h1 className='dashboard-title'>Tableau de bord</h1>
                <button
                    className='btn-icon'
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    aria-label='Rafraîchir les données'
                >
                    <FiRefreshCw className={refreshing ? 'spin' : ''} />
                </button>
            </div>

            {/* Widget du résumé du portfolio */}
            <div className='dashboard-widget glass-effect mb-4'>
                <div className='portfolio-summary'>

                    <div className='portfolio-value'>
                        {formatCurrency(portfolioValue)}
                    </div>

                    <div className={`portfolio-change ${portfolioChange >= 0 ? 'change-positive' : 'change-neagtive'}`} >
                        {portfolioChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />} {Math.abs(portfolioChange).toFixed(2)}% {activePeriod}
                    </div>

                    <div className='asset-actions mt-3'>
                        <button className='btn btn-primary'>
                            <FiDollarSign className='mr-2' />
                            Acheter
                        </button>
                        <button className='btn btn-secondary'>
                            <FiActivity className='mr-2' />
                            Vendre
                        </button>
                    </div>
                </div>
            </div>

            <div className='dashboard-grid'>
                <div>
                    {/* Widget du graphique d'évolution */}
                    <div className='dashboard-widget glass-effect mb-4'>
                        <div className='widget-header'>
                            <h2 className='widget-title'>
                                Évolution du portefeuille
                            </h2>
                            <div className='chart-controls'>
                                <button
                                    className={`chart-period-button ${activePeriod === '24h' ? 'active' : ''}`}
                                    onClick={() => setActivePeriod('24h')}
                                    aria-label='Afficher les données sur 24 heures'
                                >
                                    24h
                                </button>

                                <button
                                    className={`chart-period-button ${activePeriod === '1m' ? 'active' : ''}`}
                                    onClick={() => setActivePeriod('1m')}
                                    aria-label='Afficher les données sur 1 mois'
                                >
                                    1 mois
                                </button>

                                <button
                                    className={`chart-period-button ${activePeriod === '1a' ? 'active' : ''}`}
                                    onClick={() => setActivePeriod('1a')}
                                    aria-label='Afficher les données sur 1 an'
                                >
                                    1 an
                                </button>
                            </div>
                        </div>


                        <div className='chart-container'>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width='100%' height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke='rgba(255,255,255,0.15)' />
                                        <XAxis
                                            dataKey='date'
                                            tick={{ fontSize: 12, fill: '#1D3152' }}
                                            tickMargin={10} />

                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#1D3152' }}
                                            tickFormatter={value => `${formatCurrency(value)}`} />

                                        <Tooltip
                                            formatter={value => [formatCurrency(value), 'Valeur']}
                                            labelFormatter={label => `Date : ${label}`}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255,255,255, 0.9)',
                                                border: '1px solid rgba(255,255,255, 0.2)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Line
                                            type='monotone'
                                            dataKey="value"
                                            stroke='#00D09E'
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className='loading'>
                                    <div className='loading-spinner'></div>
                                    <span>Chargement des données...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Widget de la liste des actifs*/}
                    <div className="dashboard-widget glass-effect">
                        <div className='widget-header'>
                            <h2 className='widget-title'> Mes actifs </h2>
                            <span className='widget-action'>Voir tout</span>
                        </div>
                        {assets.length === 0 ? (
                            <div className='empty-state'>
                                <div className='empty-state-icon'>
                                    <FiBriefcase />
                                </div>
                                <h3 className='empty-state-title'>Aucun actif pour le moment</h3>
                                <p className='empty-state-description'>Commencez à construire votre portefeuille en ajoutant des crypto-monnaies</p>
                                <button className='btn btn-primary'>Explorer les crypto-monnaies</button>
                            </div>
                        ) : (
                            <div>
                                {/* Liste des actifs */}
                                {assets.map((asset) => {
                                    const price = prices[asset.id] || {};
                                    const value = asset.amount * (price.price || 0);
                                    const change24h = price.percent_change_24h || 0;

                                    return (
                                        <div className='crypto-card' key={asset.id}>

                                            <div className='crypto-icon'>
                                                <svg width="24" viewBox='0 0 24 24' fill="none" xmlns='http://www.w3.org/2000/svg'>
                                                    <path
                                                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>

                                            <div className='crypto-details'>
                                                <div className='crypto-name'>{price.name || 'Crypto'}</div>
                                                <div className='crypto-symbol'>{price.symbol || 'Crypto'}</div>
                                            </div>

                                            <div className='crypto-price'>
                                                <div className='crypto-amount'>{asset.amount}{price.symbol}</div>
                                                <div className='crypto-value'>{formatCurrency(value)}</div>
                                                <div className={`trend-indicator ${change24h >= 0 ? 'trend-indicator-up' : 'trend-indicator-down'}`}>
                                                    {change24h >= 0 ? <FiTrendingUp className='trend-arrow' /> : <FiTrendingDown className='trend-arrow' />}
                                                    {Math.abs(change24h).toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>


                <div>
                    {/* Widget des transactions récentes */}

                    <div className='dashboard-widget glass-effect mb-4'>
                        <div className='widget-header'>
                            <h2 className='widget-header'>Dernières transactions</h2>
                            <span className='widget-action'>Voir tout</span>
                        </div>
                        {transactions.length === 0 ? (
                            <div className='empty-state'>
                                <div className='empty-state-icon'>
                                    <FiClock />
                                </div>
                                <h3 className='empty-state-title'>Pas de transactions récentes</h3>
                                <p className='empty-state-description'>Vos transactions apparaîtront ici une fois que commencerez à acheter ou vendre des crypto-monnaies.</p>
                            </div>
                        ) : (
                            <div className='table-container'>
                                <table className='table'>
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Montant</th>
                                            <th>Prix</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.slice(0, 4).map(transaction => {
                                            const crypto = prices[transaction.cryptoId] || {};
                                            const date = new Date(transaction.date);

                                            return (
                                                <tr key={transaction.id}>
                                                    <td>
                                                        <span className={`transaction-type-badge transaction-type-${transaction.type.toLowerCase()}`}>
                                                            {transaction.type === 'BUY' ? 'Achat' : 'Vente'}
                                                        </span>
                                                    </td>
                                                    <td>{transaction.amount}{crypto.symbol || 'CRYPTO'}</td>
                                                    <td>{formatCurrency(transaction.price)}</td>
                                                    <td>{date.toLocaleTimeString('fr-FR')}</td>
                                                </tr>
                                            );
                                        })};
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>


                    {/* Widget des tendances du marché */}

                    <div className='dashboard-widget glass-effect'>

                        <div className='widget-header'>
                            <h2 className='widget-title'>Tendances du marché</h2>
                            <span className='widget-action' onClick={handleRefresh}>
                                Actualiser {refreshing && <FiRefreshCw className='spin' />}
                            </span>
                        </div>

                        {loading ? (
                            <div className='loading'>
                                <div className='loading-spinner'>
                                    <span>Chargement des données...</span>
                                </div>
                            </div>
                        ) : (
                            <div className='market-trends-list'>
                                {/* Bitcoin */}
                                <div className='crypto-card'>

                                    <div className='crypto-icon'>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                    <div className='crypto-details'>
                                        <div className='crypto-name'>Bitcoin</div>
                                        <div className='crypto-symbol'>BTC</div>
                                    </div>

                                    <div className='crypto-price'>
                                        <div className='crypto-amount'>
                                            {formatCurrency(prices['1']?.price || 0)}
                                        </div>

                                        <div className={`trend-indicator ${(prices['1']?.percent_change_24h || 0 >= 0 ? 'trend-indicator-up' : 'trend-indicator-down')}`}>
                                            {(prices['1']?.percent_change_24h || 0 >= 0 ?
                                                <FiTrendingUp className='trend-arrow' /> :
                                                <FiTrendingDown className='trend-arrow' />
                                            )}
                                            {Math.abs(prices['1']?.percent_change_24h || 0).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Ethereum */}
                                <div className='crypto-card'>
                                    <div className='crypto-icon'>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                    <div className='crypto-details'>
                                        <div className='crypto-name'>Ethereum</div>
                                        <div className='crypto-symbol'>ETH</div>
                                    </div>

                                    <div className='crypto-price'>
                                        <div className='crypto-amount'>
                                            {formatCurrency(prices['1027']?.percent_change_24h || 0)}
                                        </div>
                                        <div className={`trend-indicator ${(prices['1027']?.percent_change_24h || 0) >= 0 ? 'trend-indicator-up' : 'trend-indicator-down'}`}>
                                            {(prices['1027']?.percent_change_24h || 0) >= 0 ?
                                                <FiTrendingUp className="trend-arrow" /> :
                                                <FiTrendingDown className="trend-arrow" />}
                                            {Math.abs(prices['1027']?.percent_change_24h || 0).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Solana */}
                                <div className='crypto-card'>
                                    <div className='crypto-icon'>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />                                        </svg>
                                    </div>

                                    <div className='crypto-details'>
                                        <div className='crypto-name'>Solana</div>
                                        <div className='crypto-symbol'>SOL</div>
                                    </div>

                                    <div className='crypto-price'>
                                        <div className='crypto-amount'>
                                            {formatCurrency(prices['1027']?.percent_change_24h || 0)}
                                        </div>
                                        <div className={`trend-indicator ${(prices['1027']?.percent_change_24h || 0) >= 0 ? 'trend-indicator-up' : 'trend-indicator-down'}`}>
                                            {(prices['1027']?.percent_change_24h || 0) >= 0 ?
                                                <FiTrendingUp className="trend-arrow" /> :
                                                <FiTrendingDown className="trend-arrow" />}
                                            {Math.abs(prices['1027']?.percent_change_24h || 0).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>


                                {/* Informations sur le marché global*/}

                                {globalMarketData && (
                                    <div className="global-market-info mt-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Cap. marché global</span>
                                            <span className="font-weight-bold">
                                                {formatCurrency(globalMarketData.quote?.EUR?.total_market_cap || 0, 0)}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span>Vol. 24h global</span>
                                            <span className="font-weight-bold">
                                                {formatCurrency(globalMarketData.quote?.EUR?.total_volume_24h || 0, 0)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
