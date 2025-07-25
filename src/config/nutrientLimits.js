// Nutrient management limits and thresholds
// All values in kg/ha unless otherwise specified

export const NUTRIENT_LIMITS = {
  // Nitrogen limits
  N: {
    nvzLimit: 170,           // NVZ regulatory limit
    warningThreshold: 150,   // Warning threshold (approaching limit)
    highThreshold: 100,      // High application rate
    optimalMin: 50,          // Minimum for optimal growth
    optimalMax: 100,         // Maximum for optimal efficiency
    maxAbsolute: 10000       // Maximum absolute value for validation (kg total)
  },
  
  // Phosphorus limits
  P: {
    excessThreshold: 20,     // Excess P application
    highThreshold: 10,       // High P application
    optimalMin: 5,           // Minimum for optimal growth
    optimalMax: 10,          // Maximum for optimal efficiency
    soilIndex: {
      0: { min: 0, max: 9 },    // Very low
      1: { min: 10, max: 15 },  // Low
      2: { min: 16, max: 25 },  // Medium
      3: { min: 26, max: 45 },  // High
      4: { min: 46, max: 70 }   // Very high
    },
    maxAbsolute: 2000        // Maximum absolute value for validation (kg total)
  },
  
  // Potassium limits
  K: {
    excessThreshold: 60,     // Excess K application
    highThreshold: 40,       // High K application
    optimalMin: 20,          // Minimum for optimal growth
    optimalMax: 40,          // Maximum for optimal efficiency
    soilIndex: {
      0: { min: 0, max: 60 },     // Very low
      1: { min: 61, max: 120 },   // Low
      2: { min: 121, max: 240 },  // Medium (split into 2- and 2+)
      3: { min: 241, max: 400 },  // High
      4: { min: 401, max: 600 }   // Very high
    },
    maxAbsolute: 5000        // Maximum absolute value for validation (kg total)
  },
  
  // Sulphur limits
  S: {
    excessThreshold: 40,     // Excess S application
    highThreshold: 25,       // High S application
    optimalMin: 10,          // Minimum for optimal growth
    optimalMax: 25,          // Maximum for optimal efficiency
    maxAbsolute: 1000        // Maximum absolute value for validation (kg total)
  }
};

// Storage capacity defaults
export const STORAGE_DEFAULTS = {
  slurryLagoon: {
    minCapacity: 1000,       // m³
    maxCapacity: 10000,      // m³
    defaultCapacity: 3000,   // m³
    nutrientContent: {
      N: 3.0,                // kg/m³
      P: 0.6,                // kg/m³
      K: 3.5,                // kg/m³
      S: 0.3                 // kg/m³
    }
  },
  fymHeap: {
    minCapacity: 100,        // tonnes
    maxCapacity: 2000,       // tonnes
    defaultCapacity: 500,    // tonnes
    nutrientContent: {
      N: 6.0,                // kg/t
      P: 1.2,                // kg/t
      K: 7.0,                // kg/t
      S: 0.6                 // kg/t
    }
  }
};

// Livestock defaults
export const LIVESTOCK_DEFAULTS = {
  avgWeight: 650,            // kg
  milkYieldRanges: {
    high: { min: 9000, max: 12000 },    // litres/year
    mid: { min: 7000, max: 9000 },      // litres/year
    low: { min: 5000, max: 7000 }       // litres/year
  },
  manureProduction: {
    slurry: 50,              // litres/cow/day
    fym: 20                  // kg/cow/day (bedded systems)
  }
};

// Field size categories
export const FIELD_SIZE_CATEGORIES = {
  small: { max: 5 },         // ha
  medium: { min: 5, max: 15 }, // ha
  large: { min: 15, max: 30 }, // ha
  veryLarge: { min: 30 }     // ha
};

// Loss factors (as percentages)
export const LOSS_FACTORS = {
  atmospheric: {
    slurryBroadcast: 30,     // % N loss
    slurryInjection: 5,      // % N loss
    slurryTrailingShoe: 15, // % N loss
    fymIncorporated: 10,     // % N loss
    fymSurface: 25          // % N loss
  },
  leaching: {
    sandySoil: 20,          // % N loss potential
    loamSoil: 10,           // % N loss potential
    claySoil: 5             // % N loss potential
  }
};

// Helper functions
export const getNutrientStatus = (nutrient, valuePerHa) => {
  const limits = NUTRIENT_LIMITS[nutrient];
  if (!limits) return 'unknown';
  
  if (nutrient === 'N') {
    if (valuePerHa > limits.nvzLimit) return 'non-compliant';
    if (valuePerHa > limits.warningThreshold) return 'warning';
    if (valuePerHa > limits.highThreshold) return 'high';
    if (valuePerHa < limits.optimalMin) return 'low';
    return 'optimal';
  }
  
  if (valuePerHa > limits.excessThreshold) return 'excess';
  if (valuePerHa > limits.highThreshold) return 'high';
  if (valuePerHa < limits.optimalMin) return 'low';
  return 'optimal';
};

export const getStatusColor = (status) => {
  const colors = {
    'non-compliant': '#ef4444', // red-500
    'excess': '#ef4444',         // red-500
    'warning': '#f97316',        // orange-500
    'high': '#f59e0b',           // amber-500
    'optimal': '#10b981',        // emerald-500
    'low': '#3b82f6',            // blue-500
    'unknown': '#6b7280'         // gray-500
  };
  return colors[status] || colors.unknown;
};

export const validateNutrientValue = (nutrient, value) => {
  const limits = NUTRIENT_LIMITS[nutrient];
  if (!limits) return { valid: false, error: 'Unknown nutrient type' };
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return { valid: false, error: 'Invalid number' };
  if (numValue < 0) return { valid: false, error: 'Value cannot be negative' };
  if (numValue > limits.maxAbsolute) {
    return { valid: false, error: `Value exceeds maximum of ${limits.maxAbsolute} kg` };
  }
  
  return { valid: true, value: numValue };
};