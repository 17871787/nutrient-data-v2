// Key Operational Units (KOUs) Structure for High-Resolution Nutrient Budgeting

export const KOU_TYPES = {
  FIELD: 'field',
  LIVESTOCK_GROUP: 'livestock_group',
  FEED_STORE: 'feed_store',
  MANURE_STORE: 'manure_store',
  OUTPUT: 'output',
  EXTERNAL: 'external'
};

// Field use types
export const FIELD_USE_TYPES = {
  GRAZING_PLATFORM: 'grazing_platform',
  SILAGE_GROUND: 'silage_ground',
  MAIZE: 'maize',
  CEREALS: 'cereals',
  OTHER_CROPS: 'other_crops',
  PERMANENT_PASTURE: 'permanent_pasture'
};

// Livestock group types
export const LIVESTOCK_GROUPS = {
  MILKING_HIGH: 'milking_high_yielders',
  MILKING_MID: 'milking_mid_yielders',
  MILKING_LOW: 'milking_low_yielders',
  DRY_COWS: 'dry_cows',
  HEIFERS_24: 'heifers_over_24_months',
  HEIFERS_12_24: 'heifers_12_24_months',
  CALVES_12: 'calves_under_12_months'
};

// Feed store types
export const FEED_STORES = {
  GRASS_SILAGE_CLAMP_1: 'grass_silage_clamp_1',
  GRASS_SILAGE_CLAMP_2: 'grass_silage_clamp_2',
  MAIZE_SILAGE_CLAMP: 'maize_silage_clamp',
  CONCENTRATE_STORE: 'concentrate_store',
  MINERAL_STORE: 'mineral_store',
  STRAW_STORE: 'straw_store'
};

// Manure store types
export const MANURE_STORES = {
  SLURRY_LAGOON_1: 'slurry_lagoon_1',
  SLURRY_LAGOON_2: 'slurry_lagoon_2',
  SLURRY_TOWER: 'slurry_tower',
  FYM_HEAP_1: 'fym_heap_1',
  FYM_HEAP_2: 'fym_heap_2',
  DIRTY_WATER: 'dirty_water_store'
};

// Nutrient transfer pathway types
export const PATHWAY_TYPES = {
  FEEDING: 'feeding',
  MANURE_PRODUCTION: 'manure_production',
  MANURE_APPLICATION: 'manure_application',
  FERTILIZER_APPLICATION: 'fertilizer_application',
  HARVEST: 'harvest',
  GRAZING: 'grazing',
  SALE: 'sale',
  PURCHASE: 'purchase',
  ATMOSPHERIC_LOSS: 'atmospheric_loss',
  LEACHING_LOSS: 'leaching_loss',
  RUNOFF_LOSS: 'runoff_loss'
};

// Template for a KOU
export const createKOU = (type, id, name, properties = {}) => ({
  id,
  type,
  name,
  properties: {
    ...properties,
    // Nutrient content/status
    nutrients: {
      N: { total: 0, available: 0, organic: 0 },
      P: { total: 0, available: 0, index: 2 },
      K: { total: 0, available: 0, index: 2 },
      S: { total: 0, available: 0 }
    },
    // Physical properties
    area: 0, // hectares for fields
    capacity: 0, // tonnes or m³ for stores
    currentStock: 0, // current amount in store
    // Historical data
    history: []
  },
  // Connections to other KOUs
  inputs: [], // Array of pathway connections coming in
  outputs: [] // Array of pathway connections going out
});

// Template for a nutrient pathway
export const createPathway = (fromKOU, toKOU, pathwayType, nutrients = {}) => ({
  id: crypto.randomUUID ? crypto.randomUUID() : `${fromKOU}-${toKOU}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  from: fromKOU,
  to: toKOU,
  type: pathwayType,
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