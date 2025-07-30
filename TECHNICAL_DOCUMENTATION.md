# Technical Documentation - Nutrient Data Calculator v2

## Overview
This document details all equations, assumptions, and hardcoded variables used in the nutrient balance calculator. This information is intended for technical veterinary professionals who need to understand the underlying calculations.

## Table of Contents
1. [Core Equations](#core-equations)
2. [Conversion Formulas](#conversion-formulas)
3. [Hardcoded Constants](#hardcoded-constants)
4. [Assumptions](#assumptions)
5. [Default Values](#default-values)
6. [Validation Limits](#validation-limits)

---

## Core Equations

### 1. Nutrient Input Calculations

#### Feed Inputs
```javascript
// For feeds (amount in tonnes/year):
N_input = (amount × 1000 × N_content) / 100

// If CP% is provided instead of N%:
N_content = CP_content / 6.25
```

#### Fertilizer Inputs
```javascript
// For fertilizers (amount in kg/year):
N_input = (amount × N_content) / 100
```

#### Effective N Calculation
```javascript
Effective_N = Total_N × Availability_Factor

// Default availability factors:
- Mineral fertilizers: 1.0 (100%)
- Slurry/manure: 0.45 (45%)
- Chicken litter: 0.35 (35%)
- Composted FYM: 0.10 (10%)
- Fresh FYM: 0.25 (25%)
- Biosolids: 0.15 (15%)
```

### 2. Nutrient Output Calculations

#### Milk Outputs
```javascript
// Milk N calculation (milk in litres/year):
Milk_protein_kg = Milk_litres × (Protein_% / 100)
Milk_N = Milk_protein_kg × 0.16  // Protein contains 16% N

// Milk P calculation:
Milk_P = Milk_litres × 0.0009  // 0.9 g/L = 0.0009 kg/L
```

#### Livestock Outputs
```javascript
// Livestock (amount in kg liveweight):
Livestock_N = (amount × N_content) / 100
Livestock_P = (amount × P_content) / 100
```

### 3. Manure Calculations

#### Net Manure Nutrients
```javascript
Net_manure_N = Manure_applied_N + Manure_imported_N - Manure_exported_N

Where:
Manure_applied_N = Slurry_volume_m³ × N_content_kg/m³
```

#### NVZ Compliance
```javascript
Organic_N_per_hectare = Net_manure_N / Total_farm_area
NVZ_compliant = (Organic_N_per_hectare ≤ 170)
```

#### Estimated Manure Production
```javascript
// Annual N excretion rates (kg/head/year):
Milking_cow_N = 100
Youngstock_0-12_N = 25
Youngstock_12-calving_N = 40

// Annual P excretion rates (kg/head/year):
Milking_cow_P = 18
Youngstock_0-12_P = 4.5
Youngstock_12-calving_P = 7.2

Total_manure_N = Σ(Animal_numbers × Excretion_rate)
```

### 4. Farm Gate Balance
```javascript
Balance_N = Total_inputs_N - Total_outputs_N
Balance_P = Total_inputs_P - Total_outputs_P
```

### 5. Efficiency Calculations
```javascript
// Nitrogen Use Efficiency (uses effective N):
NUE = (Total_outputs_N / Effective_inputs_N) × 100

// Phosphorus Use Efficiency:
PUE = (Total_outputs_P / Total_inputs_P) × 100
```

### 6. Loss Estimates
```javascript
Estimated_N_losses = Surplus_N × 0.30  // 30% of surplus
Estimated_P_losses = Surplus_P × 0.10  // 10% of surplus
```

---

## Conversion Formulas

### Feed Rate Conversions
```javascript
// Convert kg/cow/day to tonnes/year:
Annual_tonnes = (kg_per_cow_day × num_cows × 365) / 1000

// Convert kg/L milk to tonnes/year:
Annual_tonnes = (kg_per_L × annual_milk_litres) / 1000

// Inverse conversions:
kg_per_cow_day = (annual_tonnes × 1000) / (num_cows × 365)
kg_per_L = (annual_tonnes × 1000) / annual_milk_litres
```

### Unit Conversions
```javascript
// Protein to nitrogen:
N% = CP% / 6.25

// Nutrient content conversions:
kg_nutrient = (tonnes_material × 1000 × nutrient_%) / 100
```

---

## Hardcoded Constants

### Nutritional Constants
- **Protein N content**: 16% (0.16)
- **CP to N conversion factor**: 6.25
- **Milk P content**: 0.9 g/L (0.0009 kg/L)

### Default Nutrient Contents (as-fed basis)
| Material | CP% | N% | P% | K% | S% |
|----------|-----|----|----|----|----|
| Dairy Concentrate | 15.84 | 2.88 | 0.50 | 0.50 | 0.20 |
| Grass Silage | 14.00 | 2.24 | 0.06 | 0.35 | 0.03 |
| Hay | 11.00 | 1.76 | 0.25 | 2.00 | 0.15 |
| Straw | 3.50 | 0.56 | 0.08 | 1.20 | 0.08 |
| N Fertilizer | - | 27.00 | 0.00 | 0.00 | 0.00 |
| P Fertilizer | - | 0.00 | 20.00 | 0.00 | 0.00 |
| Compound Fertilizer | - | 20.00 | 10.00 | 10.00 | 2.00 |

### Forage CP% Defaults (DM basis)
- Grass Silage: 14%
- Grazed Grass: 22%
- Whole-crop Cereal: 8%
- Maize Silage: 8%
- Hay: 11%
- Straw: 3.5%

### Fertilizer N Contents
- Ammonium Nitrate: 34.5%
- Urea: 46%
- UAN Solution: 30%
- Chicken Litter: 3.5%
- Composted FYM: 0.6%
- Fresh FYM: 0.6%
- Biosolids: 4.5%

### Slurry Defaults
- N content: 2.5 kg/m³ (typical range: 2-3)
- P content: 0.5 kg/m³ (typical range: 0.4-0.6)
- N availability: 45% (0.45)

### Animal Excretion Rates (kg/head/year)
| Animal Type | N | P |
|-------------|---|---|
| Milking Cow | 100 | 18 |
| Youngstock 0-12 months | 25 | 4.5 |
| Youngstock 12m-calving | 40 | 7.2 |

---

## Assumptions

### General Assumptions
1. **Dry Matter**: Default concentrate DM% = 88%
2. **Days per year**: 365 days for all annual calculations
3. **Milk density**: Assumed to be 1.0 (litres = kg)
4. **Loss estimates**: 
   - 30% of surplus N is lost to environment
   - 10% of surplus P is lost to environment

### NVZ Compliance
- Maximum organic N application: 170 kg/ha/year
- Only considers livestock manure N (not other organic sources)

### Nutrient Availability
- All mineral fertilizer N is 100% available
- Slurry N availability varies by application method (default 45%)
- P and K are assumed 100% available from all sources

### Feed Calculations
- CP to N conversion uses factor of 6.25 (assumes standard protein composition)
- Feed nutrient contents are on as-fed basis unless specified
- Forage nutrient contents can be adjusted based on analysis

---

## Validation Limits

### Farm Information
- Total area: 0 - 10,000 ha
- Milking cows: 0 - 5,000 head
- Youngstock: 0 - 2,000 head each category
- Milk CP%: 2 - 5%

### Nutrient Contents
- CP content: 0 - 50%
- N content: 0 - 100%
- P content: 0 - 100%
- K content: 0 - 100%
- S content: 0 - 100%
- N availability: 0 - 1 (0-100%)

### Milk Parameters
- Fat%: 2 - 6%
- Protein%: 2 - 5%

### Slurry Parameters
- Volume: 0 - 50,000 m³/year
- N content: 0 - 10 kg/m³
- P content: 0 - 5 kg/m³

---

## Data Sources and References

### Nutrient Content Sources
- Feed nutrient contents based on typical UK/Irish feed tables
- Fertilizer contents based on manufacturer specifications
- Manure excretion rates from RB209 (AHDB Nutrient Management Guide)

### Regulatory Compliance
- NVZ limit of 170 kg N/ha based on EU Nitrates Directive
- Slurry N availability factors from MANNER-NPK model

### Key Assumptions for Verification
1. All calculations assume steady-state conditions
2. No consideration of soil nutrient pools or crop uptake
3. Simple linear relationships assumed for all conversions
4. Loss estimates are simplified and may vary significantly by farm

---

## Notes for Veterinary Professionals

1. **Protein Analysis**: The system uses CP% (crude protein) rather than true protein. The 6.25 conversion factor assumes average N content in protein.

2. **Milk Composition**: The default milk P content (0.9 g/L) is an average value. Actual content varies with diet and stage of lactation.

3. **Manure Estimates**: The excretion rates are averages and don't account for:
   - Diet composition effects
   - Milk yield effects
   - Seasonal variations
   - Housing vs grazing differences

4. **Feed Analysis**: For accurate results, use laboratory feed analysis values rather than defaults when available.

5. **Limitations**: This is a simple farm-gate balance calculator. It does not model:
   - Nutrient cycling within the farm
   - Soil nutrient dynamics
   - Crop nutrient uptake
   - Detailed loss pathways

---

*Last updated: January 2025*
*Version: 2.0*