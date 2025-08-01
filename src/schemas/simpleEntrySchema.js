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
    number: z.number().int().nonnegative().optional(), // Number of cull cows (livestock only)
    avgWeightKg: z.number().positive().optional(), // Average live-weight per cow (livestock only)
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
  silage: { cp: 14.0, n: 2.24, p: 0.06, k: 2.25, s: 0.03 }, // Updated K% for grass silage
  hay: { cp: 11.0, n: 1.76, p: 0.25, k: 2.0, s: 0.15 },
  straw: { cp: 3.5, n: 0.56, p: 0.08, k: 1.2, s: 0.08 },
  fertiliser_N: { cp: 0, n: 34.5, p: 0, k: 0, s: 0 }, // Default to ammonium nitrate N%
  fertiliser_P: { cp: 0, n: 0, p: 20.0, k: 0, s: 0 },
  fertiliser_compound: { cp: 0, n: 20.0, p: 10.0, k: 10.0, s: 2.0 },
};

// Default form values with realistic test data
export const DEFAULT_FORM_VALUES = {
  farmInfo: {
    name: 'Demo Farm',
    totalArea: 120,          // 120 hectares
    milkingCows: 180,        // 180 milking cows
    youngstock0_12: 45,      // 45 calves
    youngstock12_calving: 60, // 60 heifers
    milkCPpct: 3.2,          // Average milk CP%
  },
  inputs: [
    { 
      source: 'concentrate', 
      label: 'Dairy Concentrates', 
      amount: 350,             // 350 tonnes/year
      feedMode: 'annual',      // Use annual mode for clearer display
      perCowDay: 5.32,         // ~5.3 kg/cow/day
      perL: 0.243,             // 0.243 kg/L milk
      cpContent: 18,           // 18% CP on DM basis
      nContent: 2.88,          // N% = CP/6.25
      pContent: 0.5,
      kContent: 0.5,
      sContent: 0.2
    },
    { 
      source: 'silage', 
      label: 'Forage',
      forageType: 'grass_silage', 
      amount: 2800,            // 2800 tonnes fresh weight/year
      cpContent: 14,           // 14% CP on DM basis (typical grass silage)
      nContent: 2.24,          // N% on DM basis
      pContent: 0.06,
      kContent: 2.25,          // Updated K% for grass silage
      sContent: 0.03,
      dmContent: 30            // 30% DM typical for grass silage
    },
    { 
      source: 'fertiliser_N', 
      label: 'Nitrogen Fertiliser', 
      amount: 8.5,             // 8.5 tonnes/year (ammonium nitrate)
      fertilizerType: 'ammonium_nitrate',
      availabilityN: 1.0,      // 100% available
      nContent: 34.5,          // 34.5% N
      pContent: 0,
      kContent: 0,
      sContent: 0
    },
  ],
  outputs: [
    { 
      type: 'milk', 
      label: 'Milk Sales', 
      amount: 1440000,         // 1.44 million litres/year (8000L/cow)
      fatPct: 4.1,             // 4.1% butter fat
      proteinPct: 3.3,         // 3.3% true protein
      nContent: 0.53,          // Auto-calculated from protein
      pContent: 0.09           // 0.09% P
    },
    { 
      type: 'livestock', 
      label: 'Cull Cows', 
      amount: 0,               // Legacy field, use number and avgWeightKg instead
      number: 36,              // 36 cull cows/year (20% culling rate)
      avgWeightKg: 650,        // 650 kg average live-weight
      nContent: 2.5,           // 2.5% N in carcass
      pContent: 0.7            // 0.7% P in carcass
    },
  ],
  manure: {
    slurryApplied: 4200,       // 4200 m³/year
    slurryNContent: 2.5,       // 2.5 kg N/m³
    slurryPContent: 0.5,       // 0.5 kg P/m³
    slurryAvailabilityN: 0.45, // 45% N availability
    slurryImported: 0,
    slurryImportedNContent: 2.5,
    slurryImportedPContent: 0.5,
    slurryExported: 0,
    slurryExportedNContent: 2.5,
    slurryExportedPContent: 0.5,
  },
};