// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement pour ce mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
    // Configuration du proxy pour le développement
    server: {
      proxy: {
        // Proxy pour l'API CoinMarketCap
        '/api/coinmarketcap': {
          target: 'https://pro-api.coinmarketcap.com/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/coinmarketcap/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', function(proxyReq, _req, _res) {
              // Ajouter la clé API à toutes les requêtes proxifiées
              proxyReq.setHeader('X-CMC_PRO_API_KEY', env.VITE_COINMARKETCAP_API_KEY);
            });
          }
        }
      }
    },
    
    // Améliorations pour le déploiement de production
    build: {
      // Générer des sourcemaps pour la production
      sourcemap: true,
      
      // Optimisations pour la production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Supprimer les console.log en production
        },
      },
      
      // Diviser le bundle pour optimiser le chargement
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            redux: ['redux', 'react-redux', '@reduxjs/toolkit'],
            charts: ['recharts'],
            icons: ['react-icons']
          }
        }
      }
    }
  };
});