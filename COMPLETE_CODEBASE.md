# Complete Nutrient Data Advanced Codebase

This file contains all the source code for the advanced nutrient budgeting system.

## Project Structure

```
nutrient-data-advanced/
├── src/
│   ├── components/
│   │   ├── HighResolutionNutrientBudget.jsx
│   │   ├── NutrientPathwaysView.jsx
│   │   ├── FarmNutrientMap.jsx
│   │   ├── ScenarioPlanning.jsx
│   │   └── DataManagement.jsx
│   ├── data/
│   │   └── kouStructure.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 1. package.json

```json
{
  "name": "nutrient-data-pilot",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.7.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "vite": "^5.4.19"
  }
}
```

## 2. vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})
```

## 3. tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 4. postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 5. index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>High-Resolution Nutrient Budget</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## 6. src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 7. src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 8. src/App.jsx

```jsx
import React from 'react'
import HighResolutionNutrientBudget from './components/HighResolutionNutrientBudget'

function App() {
  return <HighResolutionNutrientBudget />
}

export default App
```

## 9. src/data/kouStructure.js

```javascript
// Key Operational Unit (KOU) Types
export const KOU_TYPES = {
  FIELD: 'field',
  LIVESTOCK_GROUP: 'livestock_group',
  FEED_STORE: 'feed_store',
  MANURE_STORE: 'manure_store',
  OUTPUT: 'output',
  EXTERNAL: 'external',
};

// Field use types
export const FIELD_USE_TYPES = {
  GRAZING_PLATFORM: 'grazing_platform',
  SILAGE_GROUND: 'silage_ground',
  ARABLE: 'arable',
  MAIZE: 'maize',
  PERMANENT_PASTURE: 'permanent_pasture',
};

// Livestock group types
export const LIVESTOCK_GROUPS = {
  MILKING_HIGH: 'milking_high_yielders',
  MILKING_MID: 'milking_mid_yielders',
  MILKING_LOW: 'milking_low_yielders',
  DRY_COWS: 'dry_cows',
  YOUNGSTOCK_0_6: 'youngstock_0_6_months',
  YOUNGSTOCK_6_12: 'youngstock_6_12_months',
  YOUNGSTOCK_12_24: 'youngstock_12_24_months',
};

// Feed store types
export const FEED_STORES = {
  GRASS_SILAGE_CLAMP_1: 'grass_silage_clamp_1',
  GRASS_SILAGE_CLAMP_2: 'grass_silage_clamp_2',
  MAIZE_SILAGE_CLAMP: 'maize_silage_clamp',
  CONCENTRATE_STORE: 'concentrate_store',
  STRAW_BARN: 'straw_barn',
};

// Manure store types
export const MANURE_STORES = {
  SLURRY_LAGOON_1: 'slurry_lagoon_1',
  SLURRY_LAGOON_2: 'slurry_lagoon_2',
  FYM_HEAP_1: 'fym_heap_1',
  FYM_HEAP_2: 'fym_heap_2',
  DIRTY_WATER_TANK: 'dirty_water_tank',
};

// Pathway types (nutrient transfer mechanisms)
export const PATHWAY_TYPES = {
  FEEDING: 'feeding',
  GRAZING: 'grazing',
  MANURE_PRODUCTION: 'manure_production',
  MANURE_APPLICATION: 'manure_application',
  FERTILIZER_APPLICATION: 'fertilizer_application',
  HARVEST: 'harvest',
  SALE: 'sale',
  PURCHASE: 'purchase',
  ATMOSPHERIC_LOSS: 'atmospheric_loss',
  LEACHING_LOSS: 'leaching_loss',
  RUNOFF_LOSS: 'runoff_loss',
};

// Create a new KOU
export const createKOU = (type, id, name, properties = {}) => ({
  id,
  type,
  name,
  properties: {
    ...properties,
    nutrients: {
      N: { total: 0, available: 0, organic: 0 },
      P: { total: 0, available: 0, index: 2 },
      K: { total: 0, available: 0, index: 2 },
      S: { total: 0, available: 0 }
    }
  }
});

// Create a pathway between KOUs
export const createPathway = (from, to, type, nutrients = {}) => ({
  id: `${from}_to_${to}_${Date.now()}`,
  from,
  to,
  type,
  // Nutrient transfer quantities (kg/year)
  nutrients: {
    N: nutrients.N || 0,
    P: nutrients.P || 0,
    K: nutrients.K || 0,
    S: nutrients.S || 0
  },
  // Transfer properties
  properties: {
    date: new Date().toISOString(),
    method: '', // e.g., 'broadcast', 'injection', 'trailing_shoe'
    losses: {
      atmospheric: { N: 0, S: 0 }, // Ammonia, etc.
      leaching: { N: 0, P: 0, K: 0 },
      runoff: { N: 0, P: 0, K: 0 }
    }
  }
});

// Example farm KOU structure
export const createFarmKOUStructure = (farmData) => {
  const kous = {};
  const pathways = [];

  // Create fields
  const fields = [
    { id: 'field_1', name: 'Home Field', use: FIELD_USE_TYPES.GRAZING_PLATFORM, area: 15 },
    { id: 'field_2', name: 'Middle Field', use: FIELD_USE_TYPES.GRAZING_PLATFORM, area: 18 },
    { id: 'field_3', name: 'Far Field', use: FIELD_USE_TYPES.SILAGE_GROUND, area: 25 },
    { id: 'field_4', name: 'Maize Field', use: FIELD_USE_TYPES.MAIZE, area: 20 },
    // ... more fields
  ];

  fields.forEach(field => {
    kous[field.id] = createKOU(KOU_TYPES.FIELD, field.id, field.name, {
      use: field.use,
      area: field.area,
      soilType: 'medium',
      lastSoilTest: '2023-03-15'
    });
  });

  // Create livestock groups
  const livestockGroups = [
    { id: 'herd_high', name: 'High Yielders', type: LIVESTOCK_GROUPS.MILKING_HIGH, count: 60 },
    { id: 'herd_mid', name: 'Mid Yielders', type: LIVESTOCK_GROUPS.MILKING_MID, count: 80 },
    { id: 'herd_low', name: 'Low Yielders', type: LIVESTOCK_GROUPS.MILKING_LOW, count: 40 },
    { id: 'dry_cows', name: 'Dry Cows', type: LIVESTOCK_GROUPS.DRY_COWS, count: 30 },
  ];

  livestockGroups.forEach(group => {
    kous[group.id] = createKOU(KOU_TYPES.LIVESTOCK_GROUP, group.id, group.name, {
      groupType: group.type,
      animalCount: group.count,
      avgWeight: 650, // kg
      milkYield: group.type.includes('milking') ? 8000 : 0 // litres/year
    });
  });

  // Create feed stores
  const feedStores = [
    { id: 'silage_clamp_1', name: 'Grass Silage Clamp 1', type: FEED_STORES.GRASS_SILAGE_CLAMP_1, capacity: 1500 },
    { id: 'maize_clamp', name: 'Maize Silage Clamp', type: FEED_STORES.MAIZE_SILAGE_CLAMP, capacity: 1000 },
    { id: 'conc_store', name: 'Concentrate Store', type: FEED_STORES.CONCENTRATE_STORE, capacity: 200 },
  ];

  feedStores.forEach(store => {
    kous[store.id] = createKOU(KOU_TYPES.FEED_STORE, store.id, store.name, {
      storeType: store.type,
      capacity: store.capacity,
      currentStock: store.capacity * 0.7, // 70% full
      feedAnalysis: {
        DM: store.type.includes('silage') ? 30 : 88,
        CP: store.type.includes('silage') ? 14 : 18,
        N: store.type.includes('silage') ? 2.24 : 2.88,
        P: store.type.includes('silage') ? 0.35 : 0.45,
        K: store.type.includes('silage') ? 2.5 : 0.8
      }
    });
  });

  // Create manure stores
  const manureStores = [
    { id: 'slurry_store_1', name: 'Main Slurry Lagoon', type: MANURE_STORES.SLURRY_LAGOON_1, capacity: 3000 },
    { id: 'fym_heap', name: 'FYM Heap', type: MANURE_STORES.FYM_HEAP_1, capacity: 500 },
  ];

  manureStores.forEach(store => {
    kous[store.id] = createKOU(KOU_TYPES.MANURE_STORE, store.id, store.name, {
      storeType: store.type,
      capacity: store.capacity,
      currentStock: 0,
      nutrientContent: {
        N: store.type.includes('slurry') ? 3.0 : 6.0, // kg/m³ or kg/t
        P: store.type.includes('slurry') ? 0.6 : 1.2,
        K: store.type.includes('slurry') ? 3.5 : 7.0,
        S: store.type.includes('slurry') ? 0.3 : 0.6
      }
    });
  });

  // Create outputs
  kous['milk_output'] = createKOU(KOU_TYPES.OUTPUT, 'milk_output', 'Milk Sales');
  kous['livestock_sales'] = createKOU(KOU_TYPES.OUTPUT, 'livestock_sales', 'Livestock Sales');
  kous['crop_sales'] = createKOU(KOU_TYPES.OUTPUT, 'crop_sales', 'Crop Sales');
  kous['atmosphere'] = createKOU(KOU_TYPES.OUTPUT, 'atmosphere', 'Atmospheric Losses');

  // Create external inputs
  kous['fertilizer_supplier'] = createKOU(KOU_TYPES.EXTERNAL, 'fertilizer_supplier', 'Fertilizer Supplier');
  kous['feed_supplier'] = createKOU(KOU_TYPES.EXTERNAL, 'feed_supplier', 'Feed Supplier');

  return { kous, pathways };
};

// Calculate nutrient balance for a specific KOU
export const calculateKOUBalance = (kou, pathways) => {
  const balance = {
    N: { inputs: 0, outputs: 0, balance: 0 },
    P: { inputs: 0, outputs: 0, balance: 0 },
    K: { inputs: 0, outputs: 0, balance: 0 },
    S: { inputs: 0, outputs: 0, balance: 0 }
  };

  // Sum inputs
  pathways
    .filter(p => p.to === kou.id)
    .forEach(pathway => {
      Object.keys(balance).forEach(nutrient => {
        balance[nutrient].inputs += pathway.nutrients[nutrient] || 0;
      });
    });

  // Sum outputs
  pathways
    .filter(p => p.from === kou.id)
    .forEach(pathway => {
      Object.keys(balance).forEach(nutrient => {
        balance[nutrient].outputs += pathway.nutrients[nutrient] || 0;
      });
    });

  // Calculate balance
  Object.keys(balance).forEach(nutrient => {
    balance[nutrient].balance = balance[nutrient].inputs - balance[nutrient].outputs;
  });

  return balance;
};

// Export all constants and functions
export default {
  KOU_TYPES,
  FIELD_USE_TYPES,
  LIVESTOCK_GROUPS,
  FEED_STORES,
  MANURE_STORES,
  PATHWAY_TYPES,
  createKOU,
  createPathway,
  createFarmKOUStructure,
  calculateKOUBalance
};
```

## 10. src/components/HighResolutionNutrientBudget.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Package, Beaker, TreePine, Milk, AlertTriangle, CheckCircle, Info, Plus, ArrowRight, Settings, Database } from 'lucide-react';
import { 
  KOU_TYPES, 
  FIELD_USE_TYPES, 
  LIVESTOCK_GROUPS,
  PATHWAY_TYPES,
  createKOU, 
  createPathway,
  createFarmKOUStructure,
  calculateKOUBalance 
} from '../data/kouStructure';
import NutrientPathwaysView from './NutrientPathwaysView';
import FarmNutrientMap from './FarmNutrientMap';
import ScenarioPlanning from './ScenarioPlanning';
import DataManagement from './DataManagement';

const HighResolutionNutrientBudget = () => {
  const [selectedFarmId, setSelectedFarmId] = useState('FARM-001');
  const [activeView, setActiveView] = useState('overview');
  const [selectedKOU, setSelectedKOU] = useState(null);
  const [kous, setKous] = useState({});
  const [pathways, setPathways] = useState([]);
  const [selectedNutrient, setSelectedNutrient] = useState('N');
  const [showDataManagement, setShowDataManagement] = useState(false);

  // Initialize KOU structure
  useEffect(() => {
    // Try to load from localStorage first
    const savedData = localStorage.getItem('nutrientBudgetAdvanced');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.kous && parsed.pathways) {
          setKous(parsed.kous);
          setPathways(parsed.pathways);
          return;
        }
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
    
    // If no saved data, create default structure
    const { kous: initialKous, pathways: initialPathways } = createFarmKOUStructure({ id: selectedFarmId });
    setKous(initialKous);
    
    // Create comprehensive example pathways
    const examplePathways = [
      // External inputs
      createPathway('feed_supplier', 'conc_store', PATHWAY_TYPES.PURCHASE, { N: 5000, P: 800, K: 1200, S: 600 }),
      createPathway('fertilizer_supplier', 'field_3', PATHWAY_TYPES.FERTILIZER_APPLICATION, { N: 800, P: 150, K: 300, S: 100 }),
      createPathway('fertilizer_supplier', 'field_4', PATHWAY_TYPES.FERTILIZER_APPLICATION, { N: 600, P: 100, K: 250, S: 80 }),
      
      // Feed to livestock groups
      createPathway('silage_clamp_1', 'herd_high', PATHWAY_TYPES.FEEDING, { N: 2500, P: 400, K: 2000, S: 250 }),
      createPathway('silage_clamp_1', 'herd_mid', PATHWAY_TYPES.FEEDING, { N: 2000, P: 320, K: 1600, S: 200 }),
      createPathway('maize_clamp', 'herd_high', PATHWAY_TYPES.FEEDING, { N: 1800, P: 300, K: 1500, S: 180 }),
      createPathway('maize_clamp', 'herd_mid', PATHWAY_TYPES.FEEDING, { N: 1500, P: 250, K: 1200, S: 150 }),
      createPathway('conc_store', 'herd_high', PATHWAY_TYPES.FEEDING, { N: 3200, P: 500, K: 800, S: 400 }),
      createPathway('conc_store', 'herd_mid', PATHWAY_TYPES.FEEDING, { N: 2400, P: 380, K: 600, S: 300 }),
      createPathway('conc_store', 'herd_low', PATHWAY_TYPES.FEEDING, { N: 1600, P: 250, K: 400, S: 200 }),
      createPathway('conc_store', 'dry_cows', PATHWAY_TYPES.FEEDING, { N: 800, P: 120, K: 200, S: 100 }),
      
      // Grazing
      createPathway('field_1', 'herd_high', PATHWAY_TYPES.GRAZING, { N: 800, P: 120, K: 600, S: 80 }),
      createPathway('field_2', 'herd_mid', PATHWAY_TYPES.GRAZING, { N: 600, P: 90, K: 450, S: 60 }),
      
      // Livestock to manure
      createPathway('herd_high', 'slurry_store_1', PATHWAY_TYPES.MANURE_PRODUCTION, { N: 4200, P: 800, K: 3500, S: 420 }),
      createPathway('herd_mid', 'slurry_store_1', PATHWAY_TYPES.MANURE_PRODUCTION, { N: 3500, P: 650, K: 2900, S: 350 }),
      createPathway('herd_low', 'slurry_store_1', PATHWAY_TYPES.MANURE_PRODUCTION, { N: 2100, P: 400, K: 1750, S: 210 }),
      createPathway('dry_cows', 'fym_heap', PATHWAY_TYPES.MANURE_PRODUCTION, { N: 900, P: 180, K: 750, S: 90 }),
      
      // Manure to fields
      createPathway('slurry_store_1', 'field_1', PATHWAY_TYPES.MANURE_APPLICATION, { N: 1500, P: 300, K: 1200, S: 150 }),
      createPathway('slurry_store_1', 'field_2', PATHWAY_TYPES.MANURE_APPLICATION, { N: 1200, P: 240, K: 1000, S: 120 }),
      createPathway('slurry_store_1', 'field_3', PATHWAY_TYPES.MANURE_APPLICATION, { N: 2000, P: 400, K: 1600, S: 200 }),
      createPathway('slurry_store_1', 'field_4', PATHWAY_TYPES.MANURE_APPLICATION, { N: 1800, P: 360, K: 1450, S: 180 }),
      createPathway('fym_heap', 'field_3', PATHWAY_TYPES.MANURE_APPLICATION, { N: 600, P: 120, K: 500, S: 60 }),
      
      // Field harvest
      createPathway('field_3', 'silage_clamp_1', PATHWAY_TYPES.HARVEST, { N: 2800, P: 450, K: 2200, S: 280 }),
      createPathway('field_4', 'maize_clamp', PATHWAY_TYPES.HARVEST, { N: 2200, P: 350, K: 1800, S: 220 }),
      
      // Outputs
      createPathway('herd_high', 'milk_output', PATHWAY_TYPES.SALE, { N: 1800, P: 350, K: 600, S: 180 }),
      createPathway('herd_mid', 'milk_output', PATHWAY_TYPES.SALE, { N: 1500, P: 290, K: 500, S: 150 }),
      createPathway('herd_low', 'milk_output', PATHWAY_TYPES.SALE, { N: 900, P: 175, K: 300, S: 90 }),
      createPathway('herd_low', 'livestock_sales', PATHWAY_TYPES.SALE, { N: 200, P: 40, K: 70, S: 20 }),
      
      // Losses (simplified)
      createPathway('field_1', 'atmosphere', PATHWAY_TYPES.ATMOSPHERIC_LOSS, { N: 150, P: 0, K: 0, S: 15 }),
      createPathway('field_2', 'atmosphere', PATHWAY_TYPES.ATMOSPHERIC_LOSS, { N: 120, P: 0, K: 0, S: 12 }),
      createPathway('slurry_store_1', 'atmosphere', PATHWAY_TYPES.ATMOSPHERIC_LOSS, { N: 500, P: 0, K: 0, S: 50 }),
    ];
    
    setPathways(examplePathways);
  }, [selectedFarmId]);

  // Save to localStorage whenever kous or pathways change
  useEffect(() => {
    if (Object.keys(kous).length > 0 || pathways.length > 0) {
      const dataToSave = { kous, pathways, timestamp: new Date().toISOString() };
      localStorage.setItem('nutrientBudgetAdvanced', JSON.stringify(dataToSave));
    }
  }, [kous, pathways]);

  // Get KOU icon
  const getKOUIcon = (type) => {
    switch(type) {
      case KOU_TYPES.FIELD: return MapPin;
      case KOU_TYPES.LIVESTOCK_GROUP: return '🐄';
      case KOU_TYPES.FEED_STORE: return Package;
      case KOU_TYPES.MANURE_STORE: return Beaker;
      case KOU_TYPES.OUTPUT: return '📦';
      case KOU_TYPES.EXTERNAL: return '🏭';
      default: return Settings;
    }
  };

  // Get KOU color
  const getKOUColor = (type) => {
    switch(type) {
      case KOU_TYPES.FIELD: return 'bg-green-100 border-green-300 text-green-800';
      case KOU_TYPES.LIVESTOCK_GROUP: return 'bg-blue-100 border-blue-300 text-blue-800';
      case KOU_TYPES.FEED_STORE: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case KOU_TYPES.MANURE_STORE: return 'bg-orange-100 border-orange-300 text-orange-800';
      case KOU_TYPES.OUTPUT: return 'bg-purple-100 border-purple-300 text-purple-800';
      case KOU_TYPES.EXTERNAL: return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  // Overview View - Shows all KOUs
  const OverviewView = () => {
    const kousByType = Object.values(kous).reduce((acc, kou) => {
      if (!acc[kou.type]) acc[kou.type] = [];
      acc[kou.type].push(kou);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Farm System Overview - Key Operational Units</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Fields */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Fields ({kousByType[KOU_TYPES.FIELD]?.length || 0})
              </h3>
              <div className="space-y-2">
                {kousByType[KOU_TYPES.FIELD]?.map(kou => (
                  <div
                    key={kou.id}
                    onClick={() => setSelectedKOU(kou)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getKOUColor(kou.type)}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{kou.name}</div>
                        <div className="text-xs opacity-75">
                          {kou.properties.area} ha • {kou.properties.use?.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Livestock Groups */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">🐄</span>
                Livestock Groups ({kousByType[KOU_TYPES.LIVESTOCK_GROUP]?.length || 0})
              </h3>
              <div className="space-y-2">
                {kousByType[KOU_TYPES.LIVESTOCK_GROUP]?.map(kou => (
                  <div
                    key={kou.id}
                    onClick={() => setSelectedKOU(kou)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getKOUColor(kou.type)}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{kou.name}</div>
                        <div className="text-xs opacity-75">
                          {kou.properties.animalCount} head
                          {kou.properties.milkYield > 0 && ` • ${kou.properties.milkYield}L/cow/yr`}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed Stores */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <Package className="w-5 h-5 text-yellow-600" />
                Feed Stores ({kousByType[KOU_TYPES.FEED_STORE]?.length || 0})
              </h3>
              <div className="space-y-2">
                {kousByType[KOU_TYPES.FEED_STORE]?.map(kou => (
                  <div
                    key={kou.id}
                    onClick={() => setSelectedKOU(kou)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getKOUColor(kou.type)}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{kou.name}</div>
                        <div className="text-xs opacity-75">
                          {kou.properties.currentStock}t / {kou.properties.capacity}t
                          {kou.properties.feedAnalysis && ` • ${kou.properties.feedAnalysis.CP}% CP`}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manure Stores */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <Beaker className="w-5 h-5 text-orange-600" />
                Manure Stores ({kousByType[KOU_TYPES.MANURE_STORE]?.length || 0})
              </h3>
              <div className="space-y-2">
                {kousByType[KOU_TYPES.MANURE_STORE]?.map(kou => (
                  <div
                    key={kou.id}
                    onClick={() => setSelectedKOU(kou)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getKOUColor(kou.type)}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{kou.name}</div>
                        <div className="text-xs opacity-75">
                          {kou.properties.currentStock}m³ / {kou.properties.capacity}m³
                          {kou.properties.nutrientContent && ` • ${kou.properties.nutrientContent.N} kg N/m³`}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrient Flow Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Nutrient Flow Summary</h3>
            <div className="flex gap-2">
              {['N', 'P', 'K', 'S'].map(nutrient => (
                <button
                  key={nutrient}
                  onClick={() => setSelectedNutrient(nutrient)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    selectedNutrient === nutrient 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {nutrient}
                </button>
              ))}
            </div>
          </div>

          {/* Simple pathway visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pathways.slice(0, 6).map(pathway => {
              const fromKOU = kous[pathway.from];
              const toKOU = kous[pathway.to];
              return (
                <div key={pathway.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium text-gray-700">{fromKOU?.name || pathway.from}</div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="font-medium text-gray-700">{toKOU?.name || pathway.to}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {selectedNutrient}: {pathway.nutrients[selectedNutrient]} kg/yr
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {pathway.type.replace(/_/g, ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // KOU Detail View
  const KOUDetailView = () => {
    if (!selectedKOU) return null;

    const balance = calculateKOUBalance(selectedKOU, pathways);
    const incomingPathways = pathways.filter(p => p.to === selectedKOU.id);
    const outgoingPathways = pathways.filter(p => p.from === selectedKOU.id);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedKOU(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold text-gray-900">{selectedKOU.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${getKOUColor(selectedKOU.type)}`}>
                {selectedKOU.type.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* KOU Properties */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {selectedKOU.properties.area && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Area</div>
                <div className="text-2xl font-bold text-gray-900">{selectedKOU.properties.area} ha</div>
              </div>
            )}
            {selectedKOU.properties.animalCount && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Animal Count</div>
                <div className="text-2xl font-bold text-gray-900">{selectedKOU.properties.animalCount}</div>
              </div>
            )}
            {selectedKOU.properties.capacity && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Storage Capacity</div>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedKOU.properties.currentStock} / {selectedKOU.properties.capacity}
                  {selectedKOU.type === KOU_TYPES.MANURE_STORE ? ' m³' : ' t'}
                </div>
              </div>
            )}
          </div>

          {/* Nutrient Balance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(balance).map(([nutrient, data]) => (
              <div key={nutrient} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">{nutrient} Balance</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">In:</span>
                    <span className="font-medium text-green-600">+{data.inputs.toFixed(0)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Out:</span>
                    <span className="font-medium text-red-600">-{data.outputs.toFixed(0)} kg</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-gray-600">Net:</span>
                    <span className={`font-bold ${data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.balance >= 0 ? '+' : ''}{data.balance.toFixed(0)} kg
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pathways */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Inputs</h3>
              <div className="space-y-2">
                {incomingPathways.map(pathway => (
                  <div key={pathway.id} className="bg-green-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          From: {kous[pathway.from]?.name || pathway.from}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {pathway.type.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>N: {pathway.nutrients.N} kg</div>
                        <div>P: {pathway.nutrients.P} kg</div>
                      </div>
                    </div>
                  </div>
                ))}
                {incomingPathways.length === 0 && (
                  <div className="text-gray-500 text-sm">No inputs</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-3">Outputs</h3>
              <div className="space-y-2">
                {outgoingPathways.map(pathway => (
                  <div key={pathway.id} className="bg-red-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          To: {kous[pathway.to]?.name || pathway.to}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {pathway.type.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>N: {pathway.nutrients.N} kg</div>
                        <div>P: {pathway.nutrients.P} kg</div>
                      </div>
                    </div>
                  </div>
                ))}
                {outgoingPathways.length === 0 && (
                  <div className="text-gray-500 text-sm">No outputs</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">High-Resolution Nutrient Budget</h1>
              <p className="text-sm text-gray-600">Key Operational Units (KOU) Analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDataManagement(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Data Management
              </button>
              <button
                onClick={() => setActiveView('overview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'overview' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                System Overview
              </button>
              <button
                onClick={() => setActiveView('pathways')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'pathways' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nutrient Pathways
              </button>
              <button
                onClick={() => setActiveView('fieldmap')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'fieldmap' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Field Map
              </button>
              <button
                onClick={() => setActiveView('scenarios')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'scenarios' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Scenarios
              </button>
            </div>
          </div>
        </div>

        {/* Nutrient Selector for Pathways and Field Map Views */}
        {(activeView === 'pathways' || activeView === 'fieldmap') && !selectedKOU && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Select Nutrient to Visualize</h3>
              <div className="flex gap-2">
                {['N', 'P', 'K', 'S'].map(nutrient => (
                  <button
                    key={nutrient}
                    onClick={() => setSelectedNutrient(nutrient)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedNutrient === nutrient 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {nutrient}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {selectedKOU ? (
          <KOUDetailView />
        ) : activeView === 'pathways' ? (
          <NutrientPathwaysView 
            kous={kous} 
            pathways={pathways} 
            selectedNutrient={selectedNutrient} 
          />
        ) : activeView === 'fieldmap' ? (
          <FarmNutrientMap
            kous={kous}
            pathways={pathways}
            selectedNutrient={selectedNutrient}
          />
        ) : activeView === 'scenarios' ? (
          <ScenarioPlanning
            kous={kous}
            pathways={pathways}
          />
        ) : (
          <OverviewView />
        )}
        
        {/* Data Management Modal */}
        {showDataManagement && (
          <DataManagement
            kous={kous}
            pathways={pathways}
            onUpdateKous={setKous}
            onUpdatePathways={setPathways}
            onClose={() => setShowDataManagement(false)}
          />
        )}
      </div>
    </div>
  );
};

export default HighResolutionNutrientBudget;
```

## 11. src/components/NutrientPathwaysView.jsx

[File content continues - this is getting quite long. Would you like me to continue with the remaining component files?]