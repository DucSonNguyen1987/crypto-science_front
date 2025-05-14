// src/features/wallet/walletSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Fonction pour calculer le changement de portfolio basé sur les données réelles
const calculatePortfolioChange = (assets, currentData, previousData) => {
    if (!assets || !assets.length || !currentData || !previousData) {
        return 0;
    }

    const currentValue = assets.reduce((total, asset) => {
        const price = currentData[asset.id]?.price || 0;
        return total + (asset.amount * price);
    }, 0);

    const previousValue = assets.reduce((total, asset) => {
        const price = previousData[asset.id]?.price || 0;
        return total + (asset.amount * price);
    }, 0);

    if (previousValue === 0) return 0;

    return ((currentValue - previousValue) / previousValue) * 100;
};

// Données initiales pour le développement
const demoAssets = [
    { id: 1, amount: 0.05 },    // Bitcoin
    { id: 1027, amount: 1.2 },  // Ethereum
    { id: 5426, amount: 12 }    // Solana
];

const demoTransactions = [
    {
        id: 1,
        type: 'BUY',
        cryptoId: 1,
        amount: 0.05,
        price: 40000,
        value: 2000,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 jours avant
    },
    {
        id: 2,
        type: 'BUY',
        cryptoId: 1027,
        amount: 1.2,
        price: 2500,
        value: 3000,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 jours avant
    },
    {
        id: 3,
        type: 'BUY',
        cryptoId: 5426,
        amount: 15,
        price: 100,
        value: 1500,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours avant
    },
    {
        id: 4,
        type: 'SELL',
        cryptoId: 5426,
        amount: 3,
        price: 110,
        value: 330,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 jours avant
    }
];

// Générer un historique de portfolio fictif pour le développement
const generateDemoPortfolioHistory = () => {
    const history = [];
    const now = new Date();
    
    // Générer des points pour les 90 derniers jours
    for (let i = 90; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Valeur de base qui augmente progressivement
        const baseValue = 6000 + (i * 50);
        
        // Ajouter une petite variation aléatoire
        const randomVariation = (Math.random() - 0.5) * 500;
        
        history.push({
            timestamp: date.toISOString(),
            value: baseValue + randomVariation,
            assets: [
                { id: 1, amount: 0.05 - (i > 30 ? 0.02 : 0) },
                { id: 1027, amount: 1.2 - (i > 15 ? 0.5 : 0) },
                { id: 5426, amount: 12 - (i > 7 ? 3 : 0) }
            ]
        });
    }
    
    return history;
};

const initialState = {
    assets: demoAssets,
    transactions: demoTransactions,
    portfolioHistory: generateDemoPortfolioHistory(),
    dailyChange: 1.23,
    weeklyChange: 3.45,
    monthlyChange: 5.67,
    loading: false,
    error: null
};

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        // Ajouter une crypto-monnaie au portfolio
        addToWallet: (state, action) => {
            const { id, amount, price } = action.payload;
            
            // Validation des données
            if (!id || !amount || !price || amount <= 0 || price <= 0) {
                console.error('Invalid data provided to addToWallet', action.payload);
                return;
            }
            
            const existingAsset = state.assets.find(asset => asset.id === id);

            if (existingAsset) {
                existingAsset.amount += amount;
            } else {
                state.assets.push({ id, amount });
            }

            // Ajouter la transaction
            const value = amount * price;
            state.transactions.push({
                id: Date.now(),
                type: 'BUY',
                cryptoId: id,
                amount, 
                price,
                value,
                date: new Date().toISOString()
            });
        },
        
        // Vendre une crypto-monnaie
        removeFromWallet: (state, action) => {
            const { id, amount, price } = action.payload;
            
            // Validation des données
            if (!id || !amount || !price || amount <= 0 || price <= 0) {
                console.error('Invalid data provided to removeFromWallet', action.payload);
                return;
            }
            
            const existingAsset = state.assets.find(asset => asset.id === id);

            if (existingAsset) {
                if (existingAsset.amount <= amount) {
                    // Supprimer l'actif s'il ne reste rien
                    state.assets = state.assets.filter(asset => asset.id !== id);
                } else {
                    // Réduire le montant
                    existingAsset.amount -= amount;
                }

                // Ajouter la transaction
                const value = amount * price;
                state.transactions.push({
                    id: Date.now(),
                    type: 'SELL',
                    cryptoId: id,
                    amount,
                    price,
                    value,
                    date: new Date().toISOString()
                });
            } else {
                console.error('Attempted to sell asset not in wallet', id);
            }
        },
        
        // Initialiser les actifs depuis l'API (au chargement initial)
        setInitialAssets: (state, action) => {
            state.assets = action.payload;
        },
        
        // Initialiser les transactions depuis l'API (au chargement initial)
        setInitialTransactions: (state, action) => {
            state.transactions = action.payload;
        },
        
        // Mettre à jour les pourcentages de changement du portfolio
        updatePortfolioChanges: (state, action) => {
            const { assets, currentPrices, dailyPrices, weeklyPrices, monthlyPrices } = action.payload;

            if (dailyPrices) {
                state.dailyChange = calculatePortfolioChange(assets, currentPrices, dailyPrices);
            }
            
            if (weeklyPrices) {
                state.weeklyChange = calculatePortfolioChange(assets, currentPrices, weeklyPrices);
            }

            if (monthlyPrices) {
                state.monthlyChange = calculatePortfolioChange(assets, currentPrices, monthlyPrices);
            }
        },
        
        // Ajouter un point à l'historique du portfolio
        addPortfolioHistoryPoint: (state, action) => {
            const { timestamp, totalValue, assets } = action.payload;

            state.portfolioHistory.push({
                timestamp,
                value: totalValue,
                assets: [...assets]
            });

            // Limiter l'historique aux 90 derniers jours
            if (state.portfolioHistory.length > 90) {
                state.portfolioHistory.shift();
            }
        },
        
        // Définir l'historique complet du portfolio (depuis l'API)
        setPortfolioHistory: (state, action) => {
            state.portfolioHistory = action.payload;
        },
        
        // MAJ le statut de chargement
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        
        // Maj des erreurs
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    addToWallet,
    removeFromWallet,
    setInitialAssets,
    setInitialTransactions,
    updatePortfolioChanges,
    addPortfolioHistoryPoint,
    setPortfolioHistory,
    setLoading,
    setError
} = walletSlice.actions;

export default walletSlice.reducer;