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
      label: 'Forage', 
      amount: 2800, 
      cpContent: DEFAULT_NUTRIENT_CONTENTS.silage.cp,
      nContent: DEFAULT_NUTRIENT_CONTENTS.silage.n,
      pContent: DEFAULT_NUTRIENT_CONTENTS.silage.p,
      kContent: DEFAULT_NUTRIENT_CONTENTS.silage.k,
      sContent: DEFAULT_NUTRIENT_CONTENTS.silage.s,
      dmContent: 30  // Add default DM% for grass silage
    },
    { 
      source: 'fertiliser_N', 
      label: 'Nitrogen Fertiliser', 
      amount: 8.5,  // Changed from kg to tonnes
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