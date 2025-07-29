# Complete Nutrient Data Advanced Codebase - Updated

This file contains all the source code for the advanced nutrient budgeting system with recent updates.

## Project Structure

```
nutrient-data-advanced/
├── src/
│   ├── components/
│   │   ├── SimpleEntry/
│   │   │   ├── SimpleEntryMode.jsx
│   │   │   ├── InputRow.jsx
│   │   │   └── InlineInputRow.jsx
│   │   ├── HighResolutionNutrientBudget.jsx
│   │   ├── NutrientPathwaysView.jsx
│   │   ├── FarmNutrientMap.jsx
│   │   ├── ScenarioPlanning.jsx
│   │   ├── DataManagement.jsx
│   │   ├── GHGIndicator.jsx
│   │   ├── NutrientFlowSankey.jsx
│   │   ├── SlurryValueCard.jsx
│   │   ├── BalanceOverview.jsx
│   │   ├── KOUManager.jsx
│   │   └── PathwayManager.jsx
│   ├── data/
│   │   └── kouStructure.js
│   ├── schemas/
│   │   └── simpleEntrySchema.js
│   ├── utils/
│   │   ├── simpleCalculations.js
│   │   ├── systemCalculations.js
│   │   ├── ghgEstimation.js
│   │   └── dataTransformers.js
│   ├── constants/
│   │   └── prices.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── llms.txt
├── architecture-diagram.md
├── mental-models.md
├── documentation-viewer.html
└── README.md
```

## Key Recent Updates

1. **Dual Mode System**: Simple Entry (wizard) and Pro Mode (KOU-based)
2. **GHG Estimation**: Using NUE regression for emissions estimates
3. **Enhanced Feed Input**: 3-mode selector (kg/L milk, kg/cow/day, t/year)
4. **Milk Composition**: Dynamic N% calculation from protein%
5. **DM% for Concentrates**: CP as fed with DM% conversion
6. **Removed Mortality Field**: Simplified based on feedback
7. **Debug Mode**: Access via ?debug=1 URL parameter
8. **Comprehensive Documentation**: Added llms.txt, architecture-diagram.md, mental-models.md, and documentation-viewer.html

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
    "@hookform/resolvers": "^3.3.4",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.2",
    "recharts": "^2.7.2",
    "zod": "^3.22.4"
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

## 2. src/App.jsx

```jsx
import React, { useState, lazy, Suspense } from 'react';
import SimpleEntryMode from './components/SimpleEntry/SimpleEntryMode';

// Lazy load Pro mode to improve initial load time
const HighResolutionNutrientBudget = lazy(() => 
  import('./components/HighResolutionNutrientBudget')
);

function App() {
  const [mode, setMode] = useState('simple'); // 'simple' or 'pro'
  const [initialProData, setInitialProData] = useState(null);

  const handleSwitchToPro = (data) => {
    setInitialProData(data);
    setMode('pro');
  };

  const handleSwitchToSimple = () => {
    setMode('simple');
  };

  const handleSaveSimpleData = (data) => {
    // Save to localStorage or send to API
    localStorage.setItem('nutrientBudgetSimple', JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    }));
    alert('Data saved successfully!');
  };

  if (mode === 'simple') {
    return (
      <SimpleEntryMode 
        onSwitchToPro={handleSwitchToPro}
        onSaveData={handleSaveSimpleData}
      />
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Pro Mode...</p>
        </div>
      </div>
    }>
      <HighResolutionNutrientBudget 
        initialData={initialProData}
        onSwitchToSimple={handleSwitchToSimple}
      />
    </Suspense>
  );
}

export default App;
```

## 3. src/schemas/simpleEntrySchema.js

```javascript
import { z } from 'zod';

// Schema for Simple Entry Mode
export const simpleEntrySchema = z.object({
  farmInfo: z.object({
    name: z.string().min(1, 'Farm name is required'),
    totalArea: z.number()
      .positive('Total area must be greater than 0')
      .max(10000, 'Total area seems too large'),
    milkingCows: z.number()
      .int('Number of cows must be a whole number')
      .nonnegative('Number of cows cannot be negative')
      .max(5000, 'Number of cows seems too large'),
    youngstock0_12: z.number()
      .int('Number must be a whole number')
      .nonnegative('Cannot be negative')
      .max(2000, 'Number seems too large')
      .default(0),
    youngstock12_calving: z.number()
      .int('Number must be a whole number')
      .nonnegative('Cannot be negative')
      .max(2000, 'Number seems too large')
      .default(0),
    milkCPpct: z.number()
      .min(2, 'Milk CP% must be at least 2%')
      .max(5, 'Milk CP% seems too high')
      .default(3.2),
  }),
  
  inputs: z.array(z.object({
    source: z.enum(['concentrate', 'silage', 'hay', 'straw', 'fertiliser_N', 'fertiliser_P', 'fertiliser_compound']),
    label: z.string(),
    forageType: z.string().optional(), // For forages only
    fertilizerType: z.string().optional(), // For fertilizers only
    amount: z.number().nonnegative('Amount cannot be negative'),
    feedMode: z.enum(['annual', 'perL', 'perCowDay']).optional().default('perL'), // For feeds only
    feedRate: z.number().nonnegative().optional(), // Multi-purpose: kg/L milk or kg/cow/day depending on feedMode
    dmPct: z.number().min(0).max(100, 'DM% must be between 0-100%').optional().default(88), // Dry matter %
    cpContent: z.number().min(0).max(50, 'CP content must be between 0-50%').optional(),
    nContent: z.number().min(0).max(100, 'N content must be between 0-100%').optional(),
    availabilityN: z.number().min(0).max(1).optional(), // N-availability factor (0-1)
    pContent: z.number().min(0).max(100, 'P content must be between 0-100%'),
    kContent: z.number().min(0).max(100, 'K content must be between 0-100%').optional(),
    sContent: z.number().min(0).max(100, 'S content must be between 0-100%').optional(),
  })),
  
  outputs: z.array(z.object({
    type: z.enum(['milk', 'livestock']),
    label: z.string(),
    amount: z.number().nonnegative('Amount cannot be negative'),
    fatPct: z.number().min(2).max(6).optional(), // % butter-fat (milk only)
    proteinPct: z.number().min(2).max(5).optional(), // % true protein (milk only)
    nContent: z.number().min(0).max(10, 'N content seems too high'),
    pContent: z.number().min(0).max(10, 'P content seems too high'),
  })),
  
  manure: z.object({
    slurryApplied: z.number()
      .nonnegative('Slurry volume cannot be negative')
      .max(50000, 'Slurry volume seems too large'),
    slurryNContent: z.number()
      .min(0)
      .max(10, 'N content must be between 0-10 kg/m³'),
    slurryPContent: z.number()
      .min(0)
      .max(5, 'P content must be between 0-5 kg/m³'),
    slurryAvailabilityN: z.number()
      .min(0)
      .max(1, 'Availability must be between 0-1')
      .default(0.45),
    slurryImported: z.number()
      .nonnegative('Import volume cannot be negative')
      .max(10000, 'Import volume seems too large')
      .default(0),
    slurryImportedNContent: z.number()
      .min(0)
      .max(10, 'N content must be between 0-10 kg/m³')
      .default(2.5),
    slurryImportedPContent: z.number()
      .min(0)
      .max(5, 'P content must be between 0-5 kg/m³')
      .default(0.5),
    slurryExported: z.number()
      .nonnegative('Export volume cannot be negative')
      .max(10000, 'Export volume seems too large')
      .default(0),
    slurryExportedNContent: z.number()
      .min(0)
      .max(10, 'N content must be between 0-10 kg/m³')
      .default(2.5),
    slurryExportedPContent: z.number()
      .min(0)
      .max(5, 'P content must be between 0-5 kg/m³')
      .default(0.5),
  }),
});

// Default values for common feeds and fertilizers
export const DEFAULT_NUTRIENT_CONTENTS = {
  concentrate: { cp: 15.84, n: 2.88, p: 0.5, k: 0.5, s: 0.2 }, // CP as fed (18% DM * 0.88)
  silage: { cp: 14.0, n: 2.24, p: 0.06, k: 0.35, s: 0.03 },
  hay: { cp: 11.0, n: 1.76, p: 0.25, k: 2.0, s: 0.15 },
  straw: { cp: 3.5, n: 0.56, p: 0.08, k: 1.2, s: 0.08 },
  fertiliser_N: { cp: 0, n: 27.0, p: 0, k: 0, s: 0 },
  fertiliser_P: { cp: 0, n: 0, p: 20.0, k: 0, s: 0 },
  fertiliser_compound: { cp: 0, n: 20.0, p: 10.0, k: 10.0, s: 2.0 },
};

// Forage type defaults with CP% on DM basis
export const FORAGE_DEFAULTS = {
  'grass_silage': { label: 'Grass Silage', cp: 14 },
  'grazed_grass': { label: 'Grazed Grass', cp: 22 },
  'wholecrop_cereal': { label: 'Whole-crop Cereal Silage', cp: 8 },
  'maize_silage': { label: 'Maize Silage', cp: 8 },
  'hay': { label: 'Hay', cp: 11 },
  'straw': { label: 'Straw', cp: 3.5 }
};

// Fertilizer type defaults with N-availability factors
export const FERTILIZER_TYPES = {
  'ammonium_nitrate': { label: 'Ammonium Nitrate (34.5% N)', n: 34.5, availabilityN: 1.0 },
  'urea': { label: 'Urea (46% N)', n: 46, availabilityN: 1.0 },
  'uan': { label: 'UAN Solution (28-32% N)', n: 30, availabilityN: 1.0 },
  'chicken_litter': { label: 'Chicken Litter', n: 3.5, availabilityN: 0.35 },
  'composted_fym': { label: 'Composted FYM', n: 0.6, availabilityN: 0.1 },
  'fresh_fym': { label: 'Fresh FYM', n: 0.6, availabilityN: 0.25 },
  'biosolids': { label: 'Biosolids/Sewage Sludge', n: 4.5, availabilityN: 0.15 },
  'custom': { label: 'Custom/Other', n: 0, availabilityN: 1.0 }
};

// Default form values with realistic test data
export const DEFAULT_FORM_VALUES = {
  farmInfo: {
    name: 'Demo Farm',
    totalArea: 120,
    milkingCows: 180,
    youngstock0_12: 45,
    youngstock12_calving: 60,
    milkCPpct: 3.2,
  },
  inputs: [
    { 
      source: 'concentrate', 
      label: 'Dairy Concentrates', 
      amount: 350,
      feedMode: 'perL',
      feedRate: 0.243,
      dmPct: 88,
      cpContent: DEFAULT_NUTRIENT_CONTENTS.concentrate.cp,
      nContent: DEFAULT_NUTRIENT_CONTENTS.concentrate.n,
      pContent: DEFAULT_NUTRIENT_CONTENTS.concentrate.p,
      kContent: DEFAULT_NUTRIENT_CONTENTS.concentrate.k,
      sContent: DEFAULT_NUTRIENT_CONTENTS.concentrate.s
    },
    { 
      source: 'silage', 
      label: 'Grass Silage', 
      amount: 2800, 
      cpContent: DEFAULT_NUTRIENT_CONTENTS.silage.cp,
      nContent: DEFAULT_NUTRIENT_CONTENTS.silage.n,
      pContent: DEFAULT_NUTRIENT_CONTENTS.silage.p,
      kContent: DEFAULT_NUTRIENT_CONTENTS.silage.k,
      sContent: DEFAULT_NUTRIENT_CONTENTS.silage.s
    },
    { 
      source: 'fertiliser_N', 
      label: 'Nitrogen Fertiliser', 
      amount: 8500,
      fertilizerType: 'ammonium_nitrate',
      availabilityN: 1.0,
      nContent: DEFAULT_NUTRIENT_CONTENTS.fertiliser_N.n,
      pContent: DEFAULT_NUTRIENT_CONTENTS.fertiliser_N.p,
      kContent: DEFAULT_NUTRIENT_CONTENTS.fertiliser_N.k,
      sContent: DEFAULT_NUTRIENT_CONTENTS.fertiliser_N.s
    },
  ],
  outputs: [
    { type: 'milk', label: 'Milk Sales', amount: 1440000, fatPct: 4.1, proteinPct: 3.3, nContent: 0.53, pContent: 0.09 }, // litres/year
    { type: 'livestock', label: 'Cull Cows', amount: 12000, nContent: 2.5, pContent: 0.7 },
  ],
  manure: {
    slurryApplied: 4200,
    slurryNContent: 2.5,
    slurryPContent: 0.5,
    slurryAvailabilityN: 0.45,
    slurryImported: 0,
    slurryImportedNContent: 2.5,
    slurryImportedPContent: 0.5,
    slurryExported: 0,
    slurryExportedNContent: 2.5,
    slurryExportedPContent: 0.5,
  },
};
```

## 4. src/utils/simpleCalculations.js

```javascript
// Calculate nutrient balance from simple entry form data
export function calculateSimpleBalance(formData) {
  const { farmInfo, inputs = [], outputs = [], manure = {} } = formData;
  
  // Calculate total inputs
  const totalInputs = {
    N: 0,
    P: 0,
    K: 0,
    S: 0,
  };
  
  // Calculate effective N inputs (considering availability)
  const effectiveInputs = {
    N: 0,
    P: 0,
    K: 0,
    S: 0,
  };
  
  // Sum up feed and fertilizer inputs
  inputs.forEach(input => {
    const amount = input.amount || 0;
    const multiplier = input.source?.includes('fertiliser') ? 1 : 1000; // kg for fertilizer, tonnes to kg for feed
    
    // For feeds, convert CP to N (CP / 6.25)
    let nContent = input.nContent || 0;
    if (input.cpContent && !input.source?.includes('fertiliser')) {
      nContent = (input.cpContent || 0) / 6.25;
    }
    
    const nAmount = (amount * multiplier * nContent) / 100;
    const pAmount = (amount * multiplier * (input.pContent || 0)) / 100;
    const kAmount = (amount * multiplier * (input.kContent || 0)) / 100;
    const sAmount = (amount * multiplier * (input.sContent || 0)) / 100;
    
    totalInputs.N += nAmount;
    totalInputs.P += pAmount;
    totalInputs.K += kAmount;
    totalInputs.S += sAmount;
    
    // Calculate effective N based on availability
    const nAvailability = input.availabilityN !== undefined ? input.availabilityN : 1.0;
    effectiveInputs.N += nAmount * nAvailability;
    effectiveInputs.P += pAmount; // P availability not tracked yet
    effectiveInputs.K += kAmount;
    effectiveInputs.S += sAmount;
  });
  
  // Calculate total outputs
  const totalOutputs = {
    N: 0,
    P: 0,
    K: 0,
    S: 0,
  };
  
  // Sum up milk and livestock outputs
  outputs.forEach(output => {
    const amount = output.amount || 0;
    
    if (output.type === 'milk') {
      // Milk is now in litres/year
      // Calculate milk N from protein % (protein contains 16% N)
      const proteinPct = output.proteinPct || 3.3;
      const milkLitres = amount; // already in litres
      const milkProteinKg = milkLitres * (proteinPct / 100);
      const milkN = milkProteinKg * 0.16; // 16% N in protein
      const milkP = milkLitres * 0.0009; // 0.9 g/L
      totalOutputs.N += milkN;
      totalOutputs.P += milkP;
    } else {
      // Livestock outputs
      const livestockN = (amount * 1 * (output.nContent || 0)) / 100;
      const livestockP = (amount * 1 * (output.pContent || 0)) / 100;
      totalOutputs.N += livestockN;
      totalOutputs.P += livestockP;
    }
  });
  
  // Calculate manure nutrients including imports/exports
  const manureAppliedN = (manure.slurryApplied || 0) * (manure.slurryNContent || 0);
  const manureAppliedP = (manure.slurryApplied || 0) * (manure.slurryPContent || 0);
  
  const manureImportedN = (manure.slurryImported || 0) * (manure.slurryImportedNContent || 0);
  const manureImportedP = (manure.slurryImported || 0) * (manure.slurryImportedPContent || 0);
  
  const manureExportedN = (manure.slurryExported || 0) * (manure.slurryExportedNContent || 0);
  const manureExportedP = (manure.slurryExported || 0) * (manure.slurryExportedPContent || 0);
  
  // Add imports to total inputs
  totalInputs.N += manureImportedN;
  totalInputs.P += manureImportedP;
  
  // Add exports to total outputs
  totalOutputs.N += manureExportedN;
  totalOutputs.P += manureExportedP;
  
  // Calculate effective manure N with availability
  const slurryAvailability = manure.slurryAvailabilityN !== undefined ? manure.slurryAvailabilityN : 0.45;
  const effectiveManureN = manureImportedN * slurryAvailability;
  effectiveInputs.N += effectiveManureN;
  effectiveInputs.P += manureImportedP;
  
  // Net manure N for NVZ calculation
  const manureN = manureAppliedN + manureImportedN - manureExportedN;
  const manureP = manureAppliedP + manureImportedP - manureExportedP;
  
  // Calculate organic N per hectare for NVZ compliance
  const totalArea = farmInfo.totalArea || 1; // Avoid division by zero
  const organicNPerHa = manureN / totalArea;
  const nvzCompliant = organicNPerHa <= 170;
  
  // Calculate farm gate balance
  const balance = {
    N: totalInputs.N - totalOutputs.N,
    P: totalInputs.P - totalOutputs.P,
    K: totalInputs.K - totalOutputs.K,
    S: totalInputs.S - totalOutputs.S,
  };
  
  // Calculate efficiency using effective N for NUE
  const nEfficiency = effectiveInputs.N > 0 ? (totalOutputs.N / effectiveInputs.N) * 100 : 0;
  const pEfficiency = totalInputs.P > 0 ? (totalOutputs.P / totalInputs.P) * 100 : 0;
  
  // Calculate manure production based on livestock numbers
  const milkingCows = farmInfo.milkingCows || 0;
  const youngstock0_12 = farmInfo.youngstock0_12 || 0;
  const youngstock12_calving = farmInfo.youngstock12_calving || 0;
  
  const estimatedManureN = (milkingCows * 100) + (youngstock0_12 * 25) + (youngstock12_calving * 40);
  const estimatedManureP = (milkingCows * 18) + (youngstock0_12 * 4.5) + (youngstock12_calving * 7.2);
  
  // Estimate losses (simplified)
  const estimatedNLosses = balance.N * 0.3; // Assume 30% of surplus N is lost
  const estimatedPLosses = balance.P * 0.1; // Assume 10% of surplus P is lost
  
  return {
    totalInputs,
    effectiveInputs,
    totalOutputs,
    manureNutrients: { N: manureN, P: manureP },
    balance,
    organicNPerHa,
    nvzCompliant,
    nEfficiency,
    pEfficiency,
    estimatedLosses: { N: estimatedNLosses, P: estimatedPLosses },
    estimatedManureProduction: { N: estimatedManureN, P: estimatedManureP },
  };
}

// Generate chart data for visualization
export function generateChartData(balance) {
  const { totalInputs, totalOutputs, balance: farmBalance } = balance;
  
  // Bar chart data for inputs vs outputs
  const barChartData = [
    {
      nutrient: 'Nitrogen (N)',
      inputs: totalInputs.N / 1000, // Convert to tonnes
      outputs: totalOutputs.N / 1000,
      balance: farmBalance.N / 1000,
    },
    {
      nutrient: 'Phosphorus (P)',
      inputs: totalInputs.P / 1000,
      outputs: totalOutputs.P / 1000,
      balance: farmBalance.P / 1000,
    },
  ];
  
  // Pie chart data for N sources
  const pieChartData = [
    { name: 'Feed Inputs', value: totalInputs.N * 0.6 }, // Estimate
    { name: 'Fertilizer', value: totalInputs.N * 0.4 },
  ];
  
  return { barChartData, pieChartData };
}
```

## 5. src/utils/ghgEstimation.js

```javascript
// GHG Estimation based on NUE (Nitrogen Use Efficiency)
// Based on literature regression analysis

// Regression coefficients for different systems
const coefficients = {
  grazing: {
    intercept: 1.3845,
    slope: -0.0049,
    r_squared: 0.2145,
    rmse: 0.1823
  },
  housed: {
    intercept: 1.4823,
    slope: -0.0058,
    r_squared: 0.3289,
    rmse: 0.1654
  },
  mixed: {
    intercept: 1.4287,
    slope: -0.0053,
    r_squared: 0.2612,
    rmse: 0.1712
  }
};

/**
 * Estimate GHG emissions (kg CO2e per kg milk) from NUE
 * @param {number} nue - Nitrogen Use Efficiency (%)
 * @param {string} system - Production system: 'grazing', 'housed', or 'mixed'
 * @returns {object} - GHG estimate with confidence intervals
 */
export function estimateGHGfromNUE(nue, system = 'mixed') {
  // Validate inputs
  if (nue < 0 || nue > 100) {
    throw new Error('NUE must be between 0 and 100%');
  }
  
  // Get coefficients for the system
  const coef = coefficients[system] || coefficients.mixed;
  
  // Calculate point estimate
  const estimate = coef.intercept + (coef.slope * nue);
  
  // Calculate confidence intervals (95%)
  // Using simplified approach based on RMSE
  const ci95 = 1.96 * coef.rmse;
  
  return {
    estimate: Math.max(0, estimate), // Ensure non-negative
    lower: Math.max(0, estimate - ci95),
    upper: estimate + ci95,
    r_squared: coef.r_squared,
    rmse: coef.rmse,
    system: system,
    nue: nue,
    unit: 'kg CO2e/kg milk'
  };
}

/**
 * Calculate total farm GHG emissions
 * @param {number} nue - Nitrogen Use Efficiency (%)
 * @param {number} milkProduction - Annual milk production (litres)
 * @param {string} system - Production system
 * @returns {object} - Total GHG emissions
 */
export function calculateTotalGHG(nue, milkProduction, system = 'mixed') {
  const ghgPerKg = estimateGHGfromNUE(nue, system);
  
  // Convert litres to kg (assuming density of 1.03 kg/L)
  const milkKg = milkProduction * 1.03;
  
  return {
    totalEmissions: ghgPerKg.estimate * milkKg,
    lowerBound: ghgPerKg.lower * milkKg,
    upperBound: ghgPerKg.upper * milkKg,
    perLitre: ghgPerKg.estimate * 1.03,
    perKgMilk: ghgPerKg.estimate,
    unit: 'kg CO2e/year'
  };
}

/**
 * Get GHG reduction potential from improving NUE
 * @param {number} currentNUE - Current NUE (%)
 * @param {number} targetNUE - Target NUE (%)
 * @param {number} milkProduction - Annual milk production (litres)
 * @param {string} system - Production system
 * @returns {object} - Reduction potential
 */
export function getGHGReductionPotential(currentNUE, targetNUE, milkProduction, system = 'mixed') {
  const currentGHG = calculateTotalGHG(currentNUE, milkProduction, system);
  const targetGHG = calculateTotalGHG(targetNUE, milkProduction, system);
  
  const reduction = currentGHG.totalEmissions - targetGHG.totalEmissions;
  const reductionPercent = (reduction / currentGHG.totalEmissions) * 100;
  
  return {
    currentEmissions: currentGHG.totalEmissions,
    targetEmissions: targetGHG.totalEmissions,
    reduction: reduction,
    reductionPercent: reductionPercent,
    perLitreReduction: (currentGHG.perLitre - targetGHG.perLitre),
    unit: 'kg CO2e/year'
  };
}

/**
 * Categorize GHG performance based on emissions per litre
 * @param {number} ghgPerLitre - GHG emissions per litre milk
 * @returns {object} - Performance category and description
 */
export function categorizeGHGPerformance(ghgPerLitre) {
  if (ghgPerLitre < 0.9) {
    return {
      category: 'Excellent',
      color: 'green',
      description: 'Top 10% - Industry leading performance'
    };
  } else if (ghgPerLitre < 1.1) {
    return {
      category: 'Good',
      color: 'blue',
      description: 'Top 25% - Above average performance'
    };
  } else if (ghgPerLitre < 1.3) {
    return {
      category: 'Average',
      color: 'yellow',
      description: 'Middle 50% - Room for improvement'
    };
  } else {
    return {
      category: 'Poor',
      color: 'red',
      description: 'Bottom 25% - Significant improvement needed'
    };
  }
}
```

## 6. src/utils/systemCalculations.js

```javascript
// System-wide calculations for Pro mode

/**
 * Calculate system-wide nutrient balance
 * @param {Object} kous - Key Operational Units
 * @param {Array} pathways - Nutrient pathways
 * @returns {Object} - System balance and efficiency metrics
 */
export function calculateSystemBalance(kous, pathways) {
  // Initialize totals
  const totals = {
    inputs: { N: 0, P: 0, K: 0, S: 0 },
    outputs: { N: 0, P: 0, K: 0, S: 0 },
    internal: { N: 0, P: 0, K: 0, S: 0 },
    losses: { N: 0, P: 0, K: 0, S: 0 }
  };
  
  // Categorize pathways
  pathways.forEach(pathway => {
    const fromKOU = kous[pathway.from];
    const toKOU = kous[pathway.to];
    
    // External inputs (from EXTERNAL type KOUs)
    if (fromKOU?.type === 'external') {
      Object.keys(pathway.nutrients).forEach(nutrient => {
        totals.inputs[nutrient] += pathway.nutrients[nutrient] || 0;
      });
    }
    // Outputs (to OUTPUT type KOUs or atmosphere)
    else if (toKOU?.type === 'output' || pathway.to === 'atmosphere') {
      Object.keys(pathway.nutrients).forEach(nutrient => {
        totals.outputs[nutrient] += pathway.nutrients[nutrient] || 0;
      });
      
      // Separate losses
      if (pathway.type.includes('loss') || pathway.to === 'atmosphere') {
        Object.keys(pathway.nutrients).forEach(nutrient => {
          totals.losses[nutrient] += pathway.nutrients[nutrient] || 0;
        });
      }
    }
    // Internal transfers
    else {
      Object.keys(pathway.nutrients).forEach(nutrient => {
        totals.internal[nutrient] += pathway.nutrients[nutrient] || 0;
      });
    }
  });
  
  // Calculate balance
  const balance = {
    N: totals.inputs.N - totals.outputs.N,
    P: totals.inputs.P - totals.outputs.P,
    K: totals.inputs.K - totals.outputs.K,
    S: totals.inputs.S - totals.outputs.S
  };
  
  // Calculate efficiency (outputs excluding losses / inputs)
  const productiveOutputs = {
    N: totals.outputs.N - totals.losses.N,
    P: totals.outputs.P - totals.losses.P,
    K: totals.outputs.K - totals.losses.K,
    S: totals.outputs.S - totals.losses.S
  };
  
  const nEfficiency = totals.inputs.N > 0 
    ? (productiveOutputs.N / totals.inputs.N) * 100 
    : 0;
    
  const pEfficiency = totals.inputs.P > 0 
    ? (productiveOutputs.P / totals.inputs.P) * 100 
    : 0;
  
  // Calculate per-KOU balances
  const kouBalances = {};
  Object.keys(kous).forEach(kouId => {
    kouBalances[kouId] = calculateKOUBalance(kous[kouId], pathways);
  });
  
  return {
    inputs: totals.inputs,
    outputs: totals.outputs,
    internal: totals.internal,
    losses: totals.losses,
    balance,
    nEfficiency,
    pEfficiency,
    kouBalances
  };
}

/**
 * Calculate balance for a specific KOU
 * @param {Object} kou - Key Operational Unit
 * @param {Array} pathways - All pathways
 * @returns {Object} - KOU-specific balance
 */
export function calculateKOUBalance(kou, pathways) {
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
}

/**
 * Calculate field-level metrics
 * @param {Object} fieldKOU - Field KOU
 * @param {Array} pathways - Pathways involving this field
 * @returns {Object} - Field metrics
 */
export function calculateFieldMetrics(fieldKOU, pathways) {
  const balance = calculateKOUBalance(fieldKOU, pathways);
  const area = fieldKOU.properties.area || 1;
  
  // Calculate per-hectare values
  const perHectare = {
    N: {
      inputs: balance.N.inputs / area,
      outputs: balance.N.outputs / area,
      balance: balance.N.balance / area
    },
    P: {
      inputs: balance.P.inputs / area,
      outputs: balance.P.outputs / area,
      balance: balance.P.balance / area
    }
  };
  
  // Calculate organic N loading (from manure pathways)
  const organicN = pathways
    .filter(p => p.to === fieldKOU.id && p.type === 'manure_application')
    .reduce((sum, p) => sum + (p.nutrients.N || 0), 0);
  
  const organicNPerHa = organicN / area;
  const nvzCompliant = organicNPerHa <= 170;
  
  return {
    balance,
    perHectare,
    organicN,
    organicNPerHa,
    nvzCompliant,
    area
  };
}

/**
 * Identify nutrient hotspots and inefficiencies
 * @param {Object} kous - All KOUs
 * @param {Array} pathways - All pathways
 * @returns {Array} - List of issues/recommendations
 */
export function identifyHotspots(kous, pathways) {
  const issues = [];
  const systemBalance = calculateSystemBalance(kous, pathways);
  
  // Check overall efficiency
  if (systemBalance.nEfficiency < 25) {
    issues.push({
      type: 'critical',
      category: 'efficiency',
      message: `System N efficiency is only ${systemBalance.nEfficiency.toFixed(1)}% - well below target of 35%`,
      recommendation: 'Review protein feeding levels and fertilizer application rates'
    });
  }
  
  // Check field-level compliance
  Object.values(kous)
    .filter(kou => kou.type === 'field')
    .forEach(field => {
      const metrics = calculateFieldMetrics(field, pathways);
      if (!metrics.nvzCompliant) {
        issues.push({
          type: 'critical',
          category: 'compliance',
          message: `${field.name} exceeds NVZ limit with ${metrics.organicNPerHa.toFixed(0)} kg N/ha`,
          recommendation: 'Reduce manure application or export excess slurry'
        });
      }
      
      if (metrics.perHectare.N.balance > 250) {
        issues.push({
          type: 'warning',
          category: 'environmental',
          message: `${field.name} has high N surplus of ${metrics.perHectare.N.balance.toFixed(0)} kg/ha`,
          recommendation: 'Risk of nitrate leaching - reduce N inputs'
        });
      }
    });
  
  // Check storage capacity
  Object.values(kous)
    .filter(kou => kou.type === 'manure_store')
    .forEach(store => {
      const utilization = (store.properties.currentStock / store.properties.capacity) * 100;
      if (utilization > 90) {
        issues.push({
          type: 'warning',
          category: 'infrastructure',
          message: `${store.name} is ${utilization.toFixed(0)}% full`,
          recommendation: 'Plan manure spreading or consider storage expansion'
        });
      }
    });
  
  return issues;
}
```

## 7. src/utils/dataTransformers.js

```javascript
import { createKOU, createPathway, KOU_TYPES, PATHWAY_TYPES } from '../data/kouStructure';

// Transform simple entry data to KOU/Pathway structure
export function transformToKOUs(simpleData) {
  const { farmInfo, inputs, outputs, manure } = simpleData;
  const kous = {};
  const pathways = [];
  
  // Create farm KOU
  const farmId = `farm_${farmInfo.name.toLowerCase().replace(/\s+/g, '_')}`;
  kous[farmId] = createKOU(KOU_TYPES.FIELD, farmId, `${farmInfo.name} Farm`, {
    area: farmInfo.totalArea,
    use: 'mixed_farming',
  });
  
  // Create main field KOU (aggregate)
  const mainFieldId = 'field_main';
  kous[mainFieldId] = createKOU(KOU_TYPES.FIELD, mainFieldId, 'Main Fields', {
    area: farmInfo.totalArea,
    use: 'mixed_cropping',
  });
  
  // Create livestock groups
  const livestockId = 'herd_main';
  kous[livestockId] = createKOU(KOU_TYPES.LIVESTOCK_GROUP, livestockId, 'Dairy Herd', {
    animalCount: farmInfo.milkingCows,
    milkYield: 8000, // Assume average yield
    group: 'milking_cows',
  });
  
  // Create youngstock groups if they exist
  if (farmInfo.youngstock0_12 > 0) {
    const youngstock1Id = 'herd_youngstock_0_12';
    kous[youngstock1Id] = createKOU(KOU_TYPES.LIVESTOCK_GROUP, youngstock1Id, 'Youngstock 0-12m', {
      animalCount: farmInfo.youngstock0_12,
      milkYield: 0,
      group: 'youngstock',
    });
  }
  
  if (farmInfo.youngstock12_calving > 0) {
    const youngstock2Id = 'herd_youngstock_12_calving';
    kous[youngstock2Id] = createKOU(KOU_TYPES.LIVESTOCK_GROUP, youngstock2Id, 'Youngstock 12m-calving', {
      animalCount: farmInfo.youngstock12_calving,
      milkYield: 0,
      group: 'youngstock',
    });
  }
  
  // Create feed store
  const feedStoreId = 'feed_store_main';
  kous[feedStoreId] = createKOU(KOU_TYPES.FEED_STORE, feedStoreId, 'Feed Store', {
    capacity: 500, // Estimate based on cow numbers
    currentStock: 250,
  });
  
  // Create manure store
  const slurryStoreId = 'slurry_store_main';
  kous[slurryStoreId] = createKOU(KOU_TYPES.MANURE_STORE, slurryStoreId, 'Slurry Store', {
    capacity: 5000, // Estimate
    currentStock: manure.slurryApplied || 0,
    nutrientContent: { N: manure.slurryNContent || 2.5, P: manure.slurryPContent || 0.5 },
  });
  
  // Create external suppliers
  const feedSupplierId = 'feed_supplier';
  kous[feedSupplierId] = createKOU(KOU_TYPES.EXTERNAL, feedSupplierId, 'Feed Supplier', {});
  
  const fertilizerSupplierId = 'fertilizer_supplier';
  kous[fertilizerSupplierId] = createKOU(KOU_TYPES.EXTERNAL, fertilizerSupplierId, 'Fertilizer Supplier', {});
  
  // Create outputs
  const milkOutputId = 'milk_output';
  // Find milk output to get fat and protein percentages
  const milkOutput = outputs.find(o => o.type === 'milk');
  kous[milkOutputId] = createKOU(KOU_TYPES.OUTPUT, milkOutputId, 'Milk Sales', {
    fatPct: milkOutput?.fatPct || 4.1,
    proteinPct: milkOutput?.proteinPct || 3.3
  });
  
  const livestockSalesId = 'livestock_sales';
  kous[livestockSalesId] = createKOU(KOU_TYPES.OUTPUT, livestockSalesId, 'Livestock Sales', {});
  
  // Transform inputs to pathways
  inputs.forEach((input, index) => {
    if (input.amount > 0) {
      const amount = input.amount;
      const multiplier = input.source?.includes('fertiliser') ? 1 : 1000; // kg for fertilizer, tonnes to kg for feed
      
      // For feeds, convert CP to N if needed
      let nContent = input.nContent || 0;
      if (input.cpContent && !input.source?.includes('fertiliser')) {
        nContent = (input.cpContent || 0) / 6.25;
      }
      
      const nutrients = {
        N: (amount * multiplier * nContent) / 100,
        P: (amount * multiplier * (input.pContent || 0)) / 100,
        K: (amount * multiplier * (input.kContent || 0)) / 100,
        S: (amount * multiplier * (input.sContent || 0)) / 100,
      };
      
      if (input.source?.includes('fertiliser')) {
        // Fertilizer goes directly to fields
        pathways.push(
          createPathway(
            fertilizerSupplierId,
            mainFieldId,
            PATHWAY_TYPES.FERTILIZER_APPLICATION,
            nutrients
          )
        );
      } else {
        // Feed goes to feed store first
        pathways.push(
          createPathway(
            feedSupplierId,
            feedStoreId,
            PATHWAY_TYPES.PURCHASE,
            nutrients
          )
        );
        // Then from feed store to livestock
        pathways.push(
          createPathway(
            feedStoreId,
            livestockId,
            PATHWAY_TYPES.FEEDING,
            nutrients
          )
        );
      }
    }
  });
  
  // Transform outputs to pathways
  outputs.forEach((output) => {
    if (output.amount > 0) {
      const amount = output.amount;
      
      let nutrients;
      if (output.type === 'milk') {
        // Milk is now in litres/year
        // Calculate milk N from protein % (protein contains 16% N)
        const proteinPct = output.proteinPct || 3.3;
        const milkLitres = amount; // already in litres
        const milkProteinKg = milkLitres * (proteinPct / 100);
        nutrients = {
          N: milkProteinKg * 0.16, // 16% N in protein
          P: milkLitres * 0.0009, // 0.9 g/L
          K: 0,
          S: 0,
        };
      } else {
        const multiplier = 1; // kg for livestock
        nutrients = {
          N: (amount * multiplier * (output.nContent || 0)) / 100,
          P: (amount * multiplier * (output.pContent || 0)) / 100,
          K: 0,
          S: 0,
        };
      }
      
      const targetId = output.type === 'milk' ? milkOutputId : livestockSalesId;
      pathways.push(
        createPathway(
          livestockId,
          targetId,
          PATHWAY_TYPES.SALE,
          nutrients
        )
      );
    }
  });
  
  // Create manure pathways
  if (manure.slurryApplied > 0) {
    // Livestock to manure store
    const manureProduction = {
      N: manure.slurryApplied * (manure.slurryNContent || 2.5),
      P: manure.slurryApplied * (manure.slurryPContent || 0.5),
      K: manure.slurryApplied * 3, // Estimate
      S: manure.slurryApplied * 0.3, // Estimate
    };
    
    pathways.push(
      createPathway(
        livestockId,
        slurryStoreId,
        PATHWAY_TYPES.MANURE_PRODUCTION,
        manureProduction
      )
    );
    
    // Manure store to fields
    pathways.push(
      createPathway(
        slurryStoreId,
        mainFieldId,
        PATHWAY_TYPES.MANURE_APPLICATION,
        manureProduction
      )
    );
  }
  
  // Add some estimated losses
  const totalFieldN = pathways
    .filter(p => p.to === mainFieldId)
    .reduce((sum, p) => sum + p.nutrients.N, 0);
  
  if (totalFieldN > 0) {
    // Atmospheric losses from fields
    pathways.push(
      createPathway(
        mainFieldId,
        'atmosphere',
        PATHWAY_TYPES.ATMOSPHERIC_LOSS,
        { N: totalFieldN * 0.1, P: 0, K: 0, S: totalFieldN * 0.01 }
      )
    );
  }
  
  // Handle slurry imports
  if (manure.slurryImported > 0) {
    const importSupplierId = 'slurry_importer';
    kous[importSupplierId] = createKOU(KOU_TYPES.EXTERNAL, importSupplierId, 'Slurry Import', {});
    
    const importNutrients = {
      N: manure.slurryImported * (manure.slurryImportedNContent || 2.5),
      P: manure.slurryImported * (manure.slurryImportedPContent || 0.5),
      K: manure.slurryImported * 3,
      S: manure.slurryImported * 0.3,
    };
    
    pathways.push(
      createPathway(
        importSupplierId,
        slurryStoreId,
        PATHWAY_TYPES.PURCHASE,
        importNutrients
      )
    );
  }
  
  // Handle slurry exports
  if (manure.slurryExported > 0) {
    const exportCustomerId = 'slurry_export';
    kous[exportCustomerId] = createKOU(KOU_TYPES.OUTPUT, exportCustomerId, 'Slurry Export', {});
    
    const exportNutrients = {
      N: manure.slurryExported * (manure.slurryExportedNContent || 2.5),
      P: manure.slurryExported * (manure.slurryExportedPContent || 0.5),
      K: manure.slurryExported * 3,
      S: manure.slurryExported * 0.3,
    };
    
    pathways.push(
      createPathway(
        slurryStoreId,
        exportCustomerId,
        PATHWAY_TYPES.SALE,
        exportNutrients
      )
    );
  }
  
  return { kous, pathways };
}
```

## 8. src/components/GHGIndicator.jsx

```jsx
import React from 'react';
import { Leaf, AlertTriangle, Info } from 'lucide-react';
import { estimateGHGfromNUE, categorizeGHGPerformance } from '../utils/ghgEstimation';

export default function GHGIndicator({ nue, measured = null, system = 'mixed', showDetails = false }) {
  // Use measured value if available, otherwise estimate from NUE
  const ghgData = measured || estimateGHGfromNUE(nue, system);
  const performance = categorizeGHGPerformance(ghgData.estimate * 1.03); // Convert to per litre
  
  const getColorClasses = (category) => {
    switch (category) {
      case 'Excellent': return 'bg-green-50 border-green-300 text-green-800';
      case 'Good': return 'bg-blue-50 border-blue-300 text-blue-800';
      case 'Average': return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      case 'Poor': return 'bg-red-50 border-red-300 text-red-800';
      default: return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };
  
  return (
    <div className={`rounded-lg p-4 border-2 ${getColorClasses(performance.category)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5" />
          <h4 className="font-medium">GHG Emissions Estimate</h4>
          <div className="group relative">
            <Info className="w-4 h-4 opacity-50 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
              Estimated from NUE using regression analysis. Based on {system} system with R² = {ghgData.r_squared?.toFixed(2)}.
            </div>
          </div>
        </div>
        {performance.category === 'Poor' && <AlertTriangle className="w-5 h-5" />}
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm opacity-75">Per litre milk:</span>
          <span className="text-xl font-bold">{(ghgData.estimate * 1.03).toFixed(2)} kg CO₂e</span>
        </div>
        
        {showDetails && (
          <>
            <div className="text-xs opacity-75">
              95% CI: {(ghgData.lower * 1.03).toFixed(2)} - {(ghgData.upper * 1.03).toFixed(2)} kg CO₂e/L
            </div>
            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
              <div className="text-sm font-medium">{performance.category} Performance</div>
              <div className="text-xs opacity-75">{performance.description}</div>
            </div>
          </>
        )}
      </div>
      
      {!measured && (
        <p className="text-xs opacity-50 mt-2">
          * Estimated value. Actual measurement recommended for accuracy.
        </p>
      )}
    </div>
  );
}
```

## 9. src/components/SimpleEntry/SimpleEntryMode.jsx (Complete)

```jsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Download,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  ArrowRight,
  Tractor,
  Package,
  Milk,
  Droplets,
  BarChart3,
  Info,
  CircleDot,
  HelpCircle
} from 'lucide-react';
import { simpleEntrySchema, DEFAULT_FORM_VALUES, DEFAULT_NUTRIENT_CONTENTS, FORAGE_DEFAULTS, FERTILIZER_TYPES } from '../../schemas/simpleEntrySchema';
import { calculateSimpleBalance } from '../../utils/simpleCalculations';
import { transformToKOUs } from '../../utils/dataTransformers';
import GHGIndicator from '../GHGIndicator';

const STEPS = [
  { id: 'farm', label: 'Farm Basics', icon: Tractor },
  { id: 'inputs', label: 'Nutrient Inputs', icon: Package },
  { id: 'outputs', label: 'Nutrient Outputs', icon: Milk },
  { id: 'manure', label: 'Manure & Losses', icon: Droplets },
  { id: 'review', label: 'Review & Save', icon: BarChart3 },
];

export default function SimpleEntryMode({ onSwitchToPro, onSaveData }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(simpleEntrySchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
  });

  const { fields: inputFields, append: appendInput, remove: removeInput } = useFieldArray({
    control,
    name: 'inputs',
  });

  const { fields: outputFields } = useFieldArray({
    control,
    name: 'outputs',
  });

  const watchedValues = watch();

  // Calculate nutrient balance for review
  const nutrientBalance = calculateSimpleBalance(watchedValues);

  // Navigation handlers
  const handleNext = async () => {
    const stepFields = {
      0: ['farmInfo'],
      1: ['inputs'],
      2: ['outputs'],
      3: ['manure'],
    };

    const isValid = await trigger(stepFields[currentStep]);
    
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-2 flex-1">
                <p className={`text-sm font-medium ${
                  isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Export data as JSON
  const handleExport = () => {
    const data = getValues();
    const exportData = {
      ...data,
      calculatedBalance: nutrientBalance,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrient-budget-${data.farmInfo.name || 'farm'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Switch to Pro mode
  const handleSwitchToPro = () => {
    const data = getValues();
    const { kous, pathways } = transformToKOUs(data);
    onSwitchToPro({ kous, pathways, simpleData: data });
  };

  // Add new input row
  const addInputRow = (type) => {
    const defaults = DEFAULT_NUTRIENT_CONTENTS[type] || { cp: 0, n: 0, p: 0, k: 0, s: 0 };
    const labels = {
      concentrate: 'Concentrates',
      silage: 'Silage',
      hay: 'Hay',
      straw: 'Straw',
      fertiliser_N: 'N Fertiliser',
      fertiliser_P: 'P Fertiliser',
      fertiliser_compound: 'Compound Fertiliser',
    };
    
    appendInput({
      source: type,
      label: labels[type] || type,
      amount: 0,
      cpContent: defaults.cp,
      nContent: defaults.n,
      pContent: defaults.p,
      kContent: defaults.k,
      sContent: defaults.s,
      ...(type === 'concentrate' && { feedMode: 'perL', dmPct: 88 })
    });
  };

  // Calculate feed amount based on mode
  const calculateFeedAmount = (input, index) => {
    const { farmInfo } = watchedValues;
    const mode = input.feedMode || 'annual';
    const rate = input.feedRate || 0;
    
    let amount = 0;
    if (mode === 'perL') {
      // kg/L milk × annual milk (L) ÷ 1000 = tonnes/year
      const milkOutput = watchedValues.outputs?.find(o => o.type === 'milk');
      const annualMilk = milkOutput?.amount || 0;
      amount = (rate * annualMilk) / 1000;
    } else if (mode === 'perCowDay') {
      // kg/cow/day × cows × 365 ÷ 1000 = tonnes/year
      const cows = farmInfo?.milkingCows || 0;
      amount = (rate * cows * 365) / 1000;
    } else {
      // Direct annual tonnes
      amount = input.amount || 0;
    }
    
    // Update the amount field
    if (amount !== input.amount && mode !== 'annual') {
      setValue(`inputs.${index}.amount`, amount);
    }
    
    return amount;
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Farm Basics
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Farm Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm Name
              </label>
              <input
                {...register('farmInfo.name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter farm name"
              />
              {errors.farmInfo?.name && (
                <p className="text-red-500 text-sm mt-1">{errors.farmInfo.name.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Farm Area (ha)
                </label>
                <input
                  type="number"
                  {...register('farmInfo.totalArea', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="120"
                />
                {errors.farmInfo?.totalArea && (
                  <p className="text-red-500 text-sm mt-1">{errors.farmInfo.totalArea.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Milking Cows
                </label>
                <input
                  type="number"
                  {...register('farmInfo.milkingCows', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="180"
                />
                {errors.farmInfo?.milkingCows && (
                  <p className="text-red-500 text-sm mt-1">{errors.farmInfo.milkingCows.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Youngstock 0-12 months
                </label>
                <input
                  type="number"
                  {...register('farmInfo.youngstock0_12', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="45"
                />
                {errors.farmInfo?.youngstock0_12 && (
                  <p className="text-red-500 text-sm mt-1">{errors.farmInfo.youngstock0_12.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Youngstock 12m-calving
                </label>
                <input
                  type="number"
                  {...register('farmInfo.youngstock12_calving', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="60"
                />
                {errors.farmInfo?.youngstock12_calving && (
                  <p className="text-red-500 text-sm mt-1">{errors.farmInfo.youngstock12_calving.message}</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 1: // Nutrient Inputs
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Nutrient Inputs</h2>
            
            <div className="space-y-4">
              {inputFields.map((field, index) => {
                const input = watchedValues.inputs?.[index];
                const isConcentrate = input?.source === 'concentrate';
                const isFertilizer = input?.source?.includes('fertiliser');
                
                // Calculate actual amount for feeds
                if (!isFertilizer && input?.feedRate) {
                  calculateFeedAmount(input, index);
                }
                
                return (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">{field.label}</h3>
                      <button
                        type="button"
                        onClick={() => removeInput(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Feed rate selector for concentrates */}
                    {isConcentrate && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Feed Rate Mode
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setValue(`inputs.${index}.feedMode`, 'perL')}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                              input?.feedMode === 'perL' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            kg/L milk
                          </button>
                          <button
                            type="button"
                            onClick={() => setValue(`inputs.${index}.feedMode`, 'perCowDay')}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                              input?.feedMode === 'perCowDay' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            kg/cow/day
                          </button>
                          <button
                            type="button"
                            onClick={() => setValue(`inputs.${index}.feedMode`, 'annual')}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                              input?.feedMode === 'annual' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            t/year
                          </button>
                        </div>
                        
                        {/* Feed rate input based on mode */}
                        {input?.feedMode !== 'annual' && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {input?.feedMode === 'perL' ? 'Feed rate (kg/L milk)' : 'Feed rate (kg/cow/day)'}
                              <span className="ml-2 group relative inline-block">
                                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help inline" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                                  {input?.feedMode === 'perL' 
                                    ? 'Typical range: 0.20-0.35 kg/L. Lower = more efficient'
                                    : 'Typical range: 6-10 kg/cow/day depending on yield'}
                                </div>
                              </span>
                            </label>
                            <input
                              type="number"
                              step="0.001"
                              {...register(`inputs.${index}.feedRate`, { valueAsNumber: true })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder={input?.feedMode === 'perL' ? '0.243' : '8.0'}
                            />
                            {input?.feedRate && (
                              <p className="text-sm text-gray-600 mt-1">
                                = {(input.amount || 0).toFixed(1)} tonnes/year
                                {input?.feedMode === 'perCowDay' && watchedValues.farmInfo?.milkingCows && 
                                  ` (${((input.feedRate * 365) / 1000).toFixed(1)} t/cow/year)`
                                }
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Forage type selector */}
                    {['silage', 'hay', 'straw'].includes(input?.source) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Forage Type
                        </label>
                        <select
                          {...register(`inputs.${index}.forageType`)}
                          onChange={(e) => {
                            const forageType = e.target.value;
                            const defaults = FORAGE_DEFAULTS[forageType];
                            if (defaults) {
                              setValue(`inputs.${index}.cpContent`, defaults.cp);
                              setValue(`inputs.${index}.nContent`, defaults.cp / 6.25);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select type...</option>
                          {Object.entries(FORAGE_DEFAULTS).map(([key, value]) => (
                            <option key={key} value={key}>{value.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {/* Fertilizer type selector */}
                    {isFertilizer && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fertilizer Type
                        </label>
                        <select
                          {...register(`inputs.${index}.fertilizerType`)}
                          onChange={(e) => {
                            const fertType = e.target.value;
                            const defaults = FERTILIZER_TYPES[fertType];
                            if (defaults) {
                              setValue(`inputs.${index}.nContent`, defaults.n);
                              setValue(`inputs.${index}.availabilityN`, defaults.availabilityN);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select type...</option>
                          {Object.entries(FERTILIZER_TYPES).map(([key, value]) => (
                            <option key={key} value={key}>{value.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isFertilizer ? 'Amount (kg/year)' : 
                           input?.feedMode === 'annual' ? 'Amount (tonnes/year)' : 'Annual Amount (calculated)'}
                        </label>
                        <input
                          type="number"
                          {...register(`inputs.${index}.amount`, { valueAsNumber: true })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={isFertilizer ? '8500' : '350'}
                          readOnly={!isFertilizer && input?.feedMode !== 'annual'}
                        />
                      </div>
                      
                      {/* DM% for concentrates */}
                      {isConcentrate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dry Matter %
                          </label>
                          <input
                            type="number"
                            {...register(`inputs.${index}.dmPct`, { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="88"
                          />
                        </div>
                      )}
                      
                      {!isFertilizer && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Crude Protein % 
                            <span className="text-xs text-gray-500 ml-1">
                              {isConcentrate ? 'as fed' : 'DM basis'}
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`inputs.${index}.cpContent`, { valueAsNumber: true })}
                            onChange={(e) => {
                              const cp = parseFloat(e.target.value) || 0;
                              setValue(`inputs.${index}.nContent`, cp / 6.25);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder={isConcentrate ? '15.84' : '14.0'}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Nutrient content */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">N %</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`inputs.${index}.nContent`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          readOnly={!isFertilizer}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">P %</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`inputs.${index}.pContent`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">K %</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`inputs.${index}.kContent`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">S %</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`inputs.${index}.sContent`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* N-availability for fertilizers */}
                    {(isFertilizer || input?.fertilizerType) && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          N-availability factor (0-1)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="1"
                          {...register(`inputs.${index}.availabilityN`, { valueAsNumber: true })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Add input buttons */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Add Feed Input:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => addInputRow('concentrate')}
                    className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Concentrates
                  </button>
                  <button
                    type="button"
                    onClick={() => addInputRow('silage')}
                    className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Silage
                  </button>
                  <button
                    type="button"
                    onClick={() => addInputRow('hay')}
                    className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Hay
                  </button>
                  <button
                    type="button"
                    onClick={() => addInputRow('straw')}
                    className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Straw
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Add Fertilizer:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => addInputRow('fertiliser_N')}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    N Fertilizer
                  </button>
                  <button
                    type="button"
                    onClick={() => addInputRow('fertiliser_P')}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    P Fertilizer
                  </button>
                  <button
                    type="button"
                    onClick={() => addInputRow('fertiliser_compound')}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Compound
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2: // Nutrient Outputs
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Nutrient Outputs</h2>
            
            <div className="space-y-4">
              {outputFields.map((field, index) => {
                const output = watchedValues.outputs?.[index];
                const isMilk = output?.type === 'milk';
                
                return (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      {isMilk ? <Milk className="w-5 h-5 text-blue-600" /> : <CircleDot className="w-5 h-5 text-brown-600" />}
                      <h3 className="font-medium text-gray-900">{field.label}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount ({isMilk ? 'litres/year' : 'kg liveweight/year'})
                        </label>
                        <input
                          type="number"
                          {...register(`outputs.${index}.amount`, { valueAsNumber: true })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={isMilk ? '1440000' : '12000'}
                        />
                        {isMilk && output?.amount && watchedValues.farmInfo?.milkingCows && (
                          <p className="text-sm text-gray-600 mt-1">
                            = {(output.amount / watchedValues.farmInfo.milkingCows).toFixed(0)} L/cow/year
                          </p>
                        )}
                      </div>
                      
                      {isMilk ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Butter-fat %
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              {...register(`outputs.${index}.fatPct`, { valueAsNumber: true })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="4.1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              True Protein %
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              {...register(`outputs.${index}.proteinPct`, { valueAsNumber: true })}
                              onChange={(e) => {
                                // N% will be calculated dynamically from protein%
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="3.3"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              N content %
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              {...register(`outputs.${index}.nContent`, { valueAsNumber: true })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="2.5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              P content %
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              {...register(`outputs.${index}.pContent`, { valueAsNumber: true })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="0.7"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    
                    {isMilk && output?.proteinPct && (
                      <div className="mt-2 text-sm text-gray-600">
                        Milk N content: {(output.proteinPct * 0.16).toFixed(3)}% (calculated from protein)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
        
      case 3: // Manure & Losses
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Manure Management</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Slurry Applied to Land</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Volume (m³/year)
                  </label>
                  <input
                    type="number"
                    {...register('manure.slurryApplied', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="4200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N-availability factor
                    <span className="ml-2 group relative inline-block">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help inline" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                        Typical: 0.45 (45%) for slurry. Represents the proportion of N available to crops in the first year.
                      </div>
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    {...register('manure.slurryAvailabilityN', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N content (kg/m³)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('manure.slurryNContent', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    P content (kg/m³)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('manure.slurryPContent', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.5"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Slurry Imported</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume (m³/year)
                    </label>
                    <input
                      type="number"
                      {...register('manure.slurryImported', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      N content (kg/m³)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('manure.slurryImportedNContent', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      P content (kg/m³)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('manure.slurryImportedPContent', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.5"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Slurry Exported</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume (m³/year)
                    </label>
                    <input
                      type="number"
                      {...register('manure.slurryExported', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      N content (kg/m³)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('manure.slurryExportedNContent', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      P content (kg/m³)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('manure.slurryExportedPContent', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4: // Review & Save
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review Your Nutrient Balance</h2>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700">N Efficiency (NUE)</h3>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {nutrientBalance.nEfficiency.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Target: >35%
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${nutrientBalance.nvzCompliant ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className="text-sm font-medium text-gray-700">NVZ Compliance</h3>
                <p className={`text-2xl font-bold mt-1 ${nutrientBalance.nvzCompliant ? 'text-green-600' : 'text-red-600'}`}>
                  {nutrientBalance.organicNPerHa.toFixed(0)} kg N/ha
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Limit: 170 kg N/ha
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700">P Efficiency (PUE)</h3>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {nutrientBalance.pEfficiency.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Target: >65%
                </p>
              </div>
            </div>
            
            {/* GHG Indicator */}
            <GHGIndicator 
              nue={nutrientBalance.nEfficiency}
              showDetails={true}
            />
            
            {/* Balance Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Nutrient Balance Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total N inputs</span>
                  <span className="font-medium">{(nutrientBalance.totalInputs.N / 1000).toFixed(1)} t</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Effective N inputs</span>
                  <span className="font-medium">{(nutrientBalance.effectiveInputs.N / 1000).toFixed(1)} t</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total N outputs</span>
                  <span className="font-medium">{(nutrientBalance.totalOutputs.N / 1000).toFixed(1)} t</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                  <span className="text-sm font-medium text-gray-700">N Balance</span>
                  <span className="font-bold text-lg">{(nutrientBalance.balance.N / 1000).toFixed(1)} t</span>
                </div>
              </div>
            </div>
            
            {/* Warnings */}
            {!nutrientBalance.nvzCompliant && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">NVZ Compliance Issue</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Your organic N loading exceeds the 170 kg/ha limit. Consider exporting slurry or reducing livestock numbers.
                  </p>
                </div>
              </div>
            )}
            
            {nutrientBalance.nEfficiency < 25 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Low N Efficiency</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your N efficiency is below 25%. Review feed protein levels and fertilizer application rates.
                  </p>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
              <button
                type="button"
                onClick={handleSwitchToPro}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Convert to Pro Mode
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Debug banner */}
      {new URLSearchParams(window.location.search).get('debug') === '1' && (
        <div className="max-w-2xl mx-auto mb-4">
          <details className="bg-gray-800 text-white p-4 rounded">
            <summary className="cursor-pointer font-mono text-sm">Debug Data</summary>
            <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(watchedValues, null, 2)}</pre>
          </details>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Simple Nutrient Budget Entry</h1>
          
          <ProgressBar />
          
          <form onSubmit={handleSubmit(onSaveData)}>
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                  ${currentStep === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              
              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Data
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

## Additional Files

### 10. src/data/kouStructure.js

```javascript
// KOU (Key Operational Unit) type definitions
export const KOU_TYPES = {
  FIELD: 'field',
  LIVESTOCK_GROUP: 'livestock_group',
  FEED_STORE: 'feed_store',
  MANURE_STORE: 'manure_store',
  EXTERNAL: 'external',
  OUTPUT: 'output',
};

// Pathway type definitions
export const PATHWAY_TYPES = {
  FEEDING: 'feeding',
  MANURE_PRODUCTION: 'manure_production',
  MANURE_APPLICATION: 'manure_application',
  FERTILIZER_APPLICATION: 'fertilizer_application',
  HARVEST: 'harvest',
  SALE: 'sale',
  PURCHASE: 'purchase',
  ATMOSPHERIC_LOSS: 'atmospheric_loss',
  LEACHING_LOSS: 'leaching_loss',
};

// Factory function to create a KOU
export function createKOU(type, id, name, properties = {}) {
  return {
    id,
    type,
    name,
    properties: {
      ...properties,
      createdAt: new Date().toISOString(),
    },
  };
}

// Factory function to create a pathway
export function createPathway(from, to, type, nutrients = {}) {
  return {
    id: `${from}_to_${to}_${Date.now()}`,
    from,
    to,
    type,
    nutrients: {
      N: 0,
      P: 0,
      K: 0,
      S: 0,
      ...nutrients,
    },
    createdAt: new Date().toISOString(),
  };
}
```

### 11. src/constants/prices.js

```javascript
// Market prices for economic calculations
export const MARKET_PRICES = {
  // Fertilizer prices (£/kg nutrient)
  fertilizer: {
    N: 1.20,  // £/kg N
    P: 1.80,  // £/kg P
    K: 0.80,  // £/kg K
    S: 0.50,  // £/kg S
  },
  
  // Feed prices (£/tonne)
  feed: {
    concentrate: 280,
    silage: 45,
    hay: 120,
    straw: 80,
  },
  
  // Output prices
  output: {
    milk: 0.35,  // £/litre
    livestock: 2.20,  // £/kg liveweight
  },
  
  // Slurry value (based on nutrient content)
  slurry: {
    N: 0.60,  // £/kg N (50% of fertilizer value due to availability)
    P: 1.80,  // £/kg P (same as fertilizer)
    K: 0.80,  // £/kg K (same as fertilizer)
  },
};

// Calculate slurry value
export function calculateSlurryValue(volume, nContent, pContent, kContent = 3) {
  const nValue = volume * nContent * MARKET_PRICES.slurry.N;
  const pValue = volume * pContent * MARKET_PRICES.slurry.P;
  const kValue = volume * kContent * MARKET_PRICES.slurry.K;
  
  return {
    total: nValue + pValue + kValue,
    breakdown: {
      N: nValue,
      P: pValue,
      K: kValue,
    },
  };
}
```

### 12. llms.txt (Excerpt)

```markdown
# Nutrient Data Management System

## Project Overview
A comprehensive nutrient management tool for UK dairy farms, designed to track nutrient flows, ensure regulatory compliance, and optimize efficiency.

## Architecture
- **Frontend**: React 18 with Vite
- **State Management**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Key Features
1. **Dual-Mode System**
   - Simple Entry: 5-step wizard for quick data entry
   - Pro Mode: Detailed KOU-based modeling

2. **Compliance Tracking**
   - NVZ compliance (170 kg N/ha limit)
   - NUE and PUE efficiency metrics
   - GHG emissions estimation

3. **Advanced Feed Input**
   - Three input modes: kg/L milk, kg/cow/day, tonnes/year
   - Dynamic conversion between units
   - CP to N conversion with DM% support

4. **Data Visualization**
   - Sankey diagrams for nutrient flows
   - Bar charts for input/output comparison
   - GHG performance indicators

## Mental Models
- **Farmers**: Focus on practical metrics (feed/litre, compliance)
- **Consultants**: Focus on efficiency ratios and benchmarking
- **Vets**: Focus on nutritional precision and feed efficiency

## Recent Updates
- Added GHG estimation from NUE
- Implemented 3-mode feed rate selector
- Added milk composition fields (fat%, protein%)
- Dynamic milk N% from protein
- Added DM% for concentrate calculations
- Removed mortality field
- Added debug mode (?debug=1)
```

## Key Features Summary

1. **Dual-Mode System**
   - Simple Entry: 5-step wizard for quick data entry
   - Pro Mode: Detailed KOU-based modeling

2. **Enhanced Feed Input**
   - Three input modes: kg/L milk, kg/cow/day, tonnes/year
   - Default to kg/L for efficiency focus
   - Real-time conversion between all units

3. **Nutrient Calculations**
   - N-availability factors for accurate NUE
   - Dynamic milk N% from protein
   - CP as fed with DM% conversion for concentrates

4. **GHG Integration**
   - Estimation from NUE using regression
   - Confidence intervals
   - Performance categorization

5. **Compliance Features**
   - NVZ compliance checking (170 kg N/ha)
   - NUE and PUE efficiency metrics
   - Hotspot identification in Pro mode

6. **Data Management**
   - Import/export functionality
   - Local storage persistence
   - Debug mode for troubleshooting

7. **User Experience**
   - Progressive disclosure
   - Helpful tooltips and guidance
   - Visual indicators for performance
   - Responsive design

8. **Documentation**
   - Comprehensive technical documentation (architecture-diagram.md)
   - User mental models guide (mental-models.md)
   - Interactive HTML viewer (documentation-viewer.html)
   - LLM-friendly documentation (llms.txt)

This codebase represents a comprehensive nutrient management system designed for UK dairy farms, incorporating both simplicity for everyday users and detailed analysis capabilities for consultants and advanced farmers.