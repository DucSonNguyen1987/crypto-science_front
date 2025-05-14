import { createSlice } from '@reduxjs/toolkit';



// Fonction pour calculer le changement de portfolio basé sur les données réelles
const calculatePortfolioChange = (assets, currentData, previousData) => {
    if(!assets.length || !currentData || !previousData){
        return 0;
    }

    const currentValue = assets.value.reduce((total, asset) => {
        const price = currentData[asset.id]?.price || 0;
        return total + (asset.amount * price);
    }, 0);

    const previousValue = assets.reduce((total, asset)=> {
        const price = previousData[asset.id]?.price || 0;
        return total + (asset.amount * price);
    },0);

    if(previousValue === 0) return 0;

    return ((currentValue - previousValue) / previousValue) * 100;
};



const initialState = {
    assets : [],
    transactions : [],
    portfolioHistory : [],
    dailyChange : 0,
    weeklyChange : 0,
    monthlyChange : 0,
    loading : false,
    error : null
};

const walletSlice = createSlice ({
    name : 'wallet',
    initialState,
    reducers : {
        // Ajouter une crypto-monnaie au portfolio
        addToWallet: (state, action) => {
            const {id, amount, price} = action.payload;
            const existingAsset = state.assets.find(asset => asset.id === id);

            if (existingAsset) {
                existingAsset.amount += amount;
            } else {
                state.assets.push({ id, amount});
            }

            // Ajouter la transaction
            const value = amount *price;
            state.transactions.push ({
                id : Date.now(),
                type : 'BUY',
                cryptoId : id,
                amount, price,
                value,
                date: new Date().toISOString()});
        },
        // Vendre une crypto-monnaie
        removeFromWallet : (state, action) => {
            const { id, amount, price } = action.payload;
            const existingAsset = state.assets.find( asset => asset.id === id);

            if (existingAsset){
                if(existingAsset.amount <= amount){
                    // Supprimer l'actif
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
                    date : new Date().toISOString()
                });
            }
        },
        // Initialiser les actifs depuis l'API (au chargement initial)
        setInitialAssets : (state, action) => {
            state.assets = action.payload;
        },
        // Initialiser les transactions depuis l'API (au chargement initial)
        setInitialTransactions : (state, action) => {
            state.transactions = action.payload;
        },
        updatePortfolioChanges : (state, action) => {
            const {assets, currentPrices, dailyPrices, weeklyPrices, monthlyPrices} = action.payload;

            if (dailyPrices) {
                state.dailyChange = calculatePortfolioChange(assets, currentPrices, dailyPrices);
            }
            if (weeklyPrices) {
                state.weeklyChange = calculatePortfolioChange(assets, currentPrices, weeklyPrices);
            }

            if(monthlyPrices) {
                state.monthlyChange = calculatePortfolioChange(assets, currentPrices, monthlyPrices);
            }
        },
        // Ajouter un point à l'historique du portfolio
        addPortfolioHistoryPoint : (state, action) => {
            const {timestamp, totalValue, assets} = action.payload;

            state.portfolioHistory.push({
                timestamp,
                value : totalValue,
                assets : [...assets]
            });

            // Limiter l'historique aux 90 derniers jours
            if(state.portfolioHistory.length > 90){
                state.portfolioHistory.shift();
            }
        },
        // Définir l'historique complet du portfolio (depuis l'API)
        setportfolioHistory : (state, action) => {
            state.portfolioHistory = action.payload;
        },
        // MAJ le statut de changement
        setLoading : (state, action) => {
            state.loading = action.payload;
        },
        // Maj des erreurs
        setError : (state, action) => {
            state.error = action.payload;
        }
    }
});



export const {
    addToWallet,
    removeFromWallet,
    setInitialAssets,
    updatePortfolioChanges,
    addPortfolioHistoryPoint,
    setportfolioHistory,
    setLoading,
    setError
} = walletSlice.actions;

export default walletSlice.reducer;