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
  }),
  
  inputs: z.array(z.object({
    source: z.enum(['concentrate', 'silage', 'hay', 'straw', 'fertiliser_N', 'fertiliser_P', 'fertiliser_compound']),
    label: z.string(),
    amount: z.number().nonnegative('Amount cannot be negative'),
    nContent: z.number().min(0).max(100, 'N content must be between 0-100%'),
    pContent: z.number().min(0).max(100, 'P content must be between 0-100%'),
    kContent: z.number().min(0).max(100, 'K content must be between 0-100%').optional(),
    sContent: z.number().min(0).max(100, 'S content must be between 0-100%').optional(),
  })),
  
  outputs: z.array(z.object({
    type: z.enum(['milk', 'livestock']),
    label: z.string(),
    amount: z.number().nonnegative('Amount cannot be negative'),
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
  }),
});

// Default values for common feeds and fertilizers
export const DEFAULT_NUTRIENT_CONTENTS = {
  concentrate: { n: 2.5, p: 0.5, k: 0.5, s: 0.2 },
  silage: { n: 0.35, p: 0.06, k: 0.35, s: 0.03 },
  hay: { n: 1.8, p: 0.25, k: 2.0, s: 0.15 },
  straw: { n: 0.5, p: 0.08, k: 1.2, s: 0.08 },
  fertiliser_N: { n: 27.0, p: 0, k: 0, s: 0 },
  fertiliser_P: { n: 0, p: 20.0, k: 0, s: 0 },
  fertiliser_compound: { n: 20.0, p: 10.0, k: 10.0, s: 2.0 },
};

// Default form values with realistic test data
export const DEFAULT_FORM_VALUES = {
  farmInfo: {
    name: 'Demo Farm',
    totalArea: 120,
    milkingCows: 180,
  },
  inputs: [
    { 
      source: 'concentrate', 
      label: 'Dairy Concentrates', 
      amount: 350, 
      nContent: DEFAULT_NUTRIENT_CONTENTS.concentrate.n,
      pContent: DEFAULT_NUTRIENT_CONTENTS.concentrate.p,
      kContent: DEFAULT_NUTRIENT_CONTENTS.concentrate.k,
      sContent: DEFAULT_NUTRIENT_CONTENTS.concentrate.s
    },
    { 
      source: 'silage', 
      label: 'Grass Silage', 
      amount: 2800, 
      nContent: DEFAULT_NUTRIENT_CONTENTS.silage.n,
      pContent: DEFAULT_NUTRIENT_CONTENTS.silage.p,
      kContent: DEFAULT_NUTRIENT_CONTENTS.silage.k,
      sContent: DEFAULT_NUTRIENT_CONTENTS.silage.s
    },
    { 
      source: 'fertiliser_N', 
      label: 'Nitrogen Fertiliser', 
      amount: 8500, 
      nContent: DEFAULT_NUTRIENT_CONTENTS.fertiliser_N.n,
      pContent: DEFAULT_NUTRIENT_CONTENTS.fertiliser_N.p,
      kContent: DEFAULT_NUTRIENT_CONTENTS.fertiliser_N.k,
      sContent: DEFAULT_NUTRIENT_CONTENTS.fertiliser_N.s
    },
  ],
  outputs: [
    { type: 'milk', label: 'Milk Sales', amount: 1440, nContent: 0.53, pContent: 0.09 },
    { type: 'livestock', label: 'Cull Cows', amount: 12000, nContent: 2.5, pContent: 0.7 },
  ],
  manure: {
    slurryApplied: 4200,
    slurryNContent: 2.5,
    slurryPContent: 0.5,
  },
};