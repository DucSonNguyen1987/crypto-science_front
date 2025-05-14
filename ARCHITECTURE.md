# Architecture détaillée de l'application Crypto Science

Ce document présente l'architecture détaillée de l'application Crypto Science, expliquant les choix de conception, les flux de données et les patterns utilisés.

## Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Interface Utilisateur                        │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───┐  │
│  │Dashboard │  │Portfolio │  │  Explore │  │ Settings │  │...│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─┬─┘  │
│       │            │             │              │           │    │
└───────┼────────────┼─────────────┼──────────────┼───────────┼────┘
        │            │             │              │           │
┌───────┼────────────┼─────────────┼──────────────┼───────────┼────┐
│       │            │             │              │           │    │
│       ▼            ▼             ▼              ▼           ▼    │
│   ┌────────────────────────────────────────────────────────┐    │
│   │                    Composants Partagés                  │    │
│   └────────────────────────────────────────────────────────┘    │
│                                                                 │
│   ┌─────────────────────┐       ┌────────────────────────────┐  │
│   │     App Context     │◄──────┤    DemoModeIndicator       │  │
│   └──────────┬──────────┘       └────────────────────────────┘  │
│              │                                                   │
└──────────────┼───────────────────────────────────────────────────┘
               │
┌──────────────┼───────────────────────────────────────────────────┐
│              │                                                   │
│   ┌──────────▼─────────┐      ┌────────────────────────────┐     │
│   │                    │      │                            │     │
│   │   Redux Store      │◄─────┤        Redux Actions       │     │
│   │                    │      │                            │     │
│   └──────────┬─────────┘      └──────────┬─────────────────┘     │
│              │                           │                       │
│              ▼                           │                       │
│   ┌────────────────────┐                 │                       │
│   │    market Slice    │◄────────────────┘                       │
│   └─────────┬──────────┘                                         │
│             │           ┌────────────────────────────┐           │
│             │           │                            │           │
│             └──────────►│    wallet Slice            │           │
│                         │                            │           │
│                         └──────────┬─────────────────┘           │
│                                    │                             │
└────────────────────────────────────┼─────────────────────────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────┐
│                                    │                             │
│  ┌─────────────────────────────────▼────────────────────────┐    │
│  │                   Services API Abstraits                  │    │
│  └────────────────────────────┬────────────────────────────┬┘    │
│                               │                            │     │
│                               ▼                            ▼     │
│  ┌────────────────────┐   ┌───────────────────┐    ┌─────────────┐
│  │                    │   │                   │    │             │
│  │ CoinMarketCap API  │   │ Données Simulées  │    │ Autres APIs │
│  │                    │   │                   │    │             │
│  └────────────────────┘   └───────────────────┘    └─────────────┘
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Principes d'architecture

L'application est conçue selon les principes suivants:

1. **Séparation des préoccupations** - Chaque partie du code a une responsabilité unique et clairement définie
2. **Architecture en couches** - Séparation claire entre l'interface utilisateur, la logique métier et les services de données
3. **Inversions de dépendances** - Les couches supérieures ne dépendent pas des détails d'implémentation des couches inférieures
4. **Pattern Repository** - Abstraction de la source des données
5. **Stratégie** - Possibilité de changer d'implémentation selon le contexte (mode démo/réel)

## Couches de l'application

### 1. Interface Utilisateur (UI)

La couche de présentation est responsable de l'affichage des données et de l'interaction avec l'utilisateur.

**Composants:**
- Pages (`/src/pages/*`)
- Composants partagés (`/src/components/*`)
- Layouts (`/src/layout/*`)

**Principales responsabilités:**
- Rendu des données
- Gestion des interactions utilisateur
- Appel aux actions Redux
- Gestion des états locaux des composants

### 2. Contexte d'Application

Le contexte d'application gère les états globaux de l'UI qui ne sont pas liés aux données métier.

**Composants:**
- AppContext (`/src/context/AppContext.jsx`)
- DemoModeIndicator (`/src/components/DemoModeIndicator.jsx`)

**Principales responsabilités:**
- Gestion du thème (clair/sombre)
- Gestion du mode de données (démo/réel)
- Paramètres globaux de l'application

### 3. Gestion d'État (Redux)

La couche de gestion d'état est responsable du stockage et de la manipulation des données métier.

**Composants:**
- Store Redux (`/src/store/index.js`)
- Slices Redux (`/src/features/*/*.js`)
- Actions et Reducers

**Principales responsabilités:**
- Stockage centralisé des données
- Logique métier de manipulation des données
- Coordination des appels aux services de données

### 4. Services de Données

La couche de services gère l'accès aux données, qu'elles proviennent d'une API ou qu'elles soient générées localement.

**Composants:**
- Configuration API (`/src/services/apiConfig.js`)
- Service abstrait (`/src/services/cryptoApiService.js`)
- Implémentation CoinMarketCap (`/src/services/coinMarketCapService.js`)
- Données simulées (`/src/services/mockCryptoData.js`)

**Principales responsabilités:**
- Abstraction des sources de données
- Formatage des données pour l'application
- Gestion des erreurs et fallbacks

## Flux de données

### 1. Récupération des prix crypto-monnaies

```
Composant React → Action Redux → cryptoApiService → coinMarketCapService/mockCryptoData → Store Redux → UI
```

1. Un composant déclenche une action Redux (`fetchCryptoPrices`)
2. Le thunk Redux appelle le service API abstrait
3. Le service API choisit l'implémentation appropriée selon le mode
4. Les données sont récupérées et formatées
5. Les données sont stockées dans le Redux store
6. Les composants se mettent à jour avec les nouvelles données

### 2. Changement de mode (démo/réel)

```
DemoModeIndicator → AppContext → cryptoApiService → Redux actions → Store Redux → UI
```

1. L'utilisateur clique sur le bouton de changement de mode
2. Le contexte d'application met à jour l'état du mode
3. Les prochains appels au service API utiliseront la nouvelle implémentation
4. Les actions Redux récupèrent les données via la nouvelle source
5. Le store est mis à jour avec les nouvelles données
6. L'UI reflète les changements

## Gestion des erreurs et fallbacks

L'application implémente une stratégie robuste de gestion des erreurs:

1. **Détection d'erreurs API** - Tous les appels aux services sont encapsulés dans des blocs try-catch
2. **Fallback automatique** - En cas d'erreur API, l'application bascule automatiquement vers les données simulées
3. **Notification utilisateur** - Les erreurs pertinentes sont affichées à l'utilisateur
4. **Retry et backoff** - Pour certaines opérations critiques, l'application tente de réessayer avec un délai croissant

## Extensibilité

L'architecture a été conçue pour faciliter l'ajout de nouvelles fonctionnalités:

1. **Nouvelles sources de données** - Il suffit d'ajouter une nouvelle implémentation conforme à l'interface du service API
2. **Nouveaux types de crypto-monnaies** - Le système est générique et ne dépend pas d'une liste fixe
3. **Nouvelles visualisations** - La séparation des données et de la présentation facilite l'ajout de nouvelles vues

## Considérations pour la production

Pour une application en production, voici les améliorations à considérer:

1. **Backend sécurisé** - Ajouter un backend Node.js pour les appels API sensibles
2. **Authentication** - Implémenter un système d'authentification complet
3. **Tests automatisés** - Ajouter des tests unitaires, d'intégration et end-to-end
4. **Monitoring** - Ajouter des outils de suivi des performances et des erreurs
5. **Internationalisation** - Ajouter le support multi-langues