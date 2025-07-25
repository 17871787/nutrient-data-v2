// Fertiliser prices per kg
// Based on typical UK prices - update these based on current market rates
export const FERTILISER_PRICES = {
  N: 0.85, // £/kg - Ammonium Nitrate equivalent
  P: 1.45, // £/kg - Triple Super Phosphate equivalent
  K: 0.70, // £/kg - Muriate of Potash equivalent
  S: 0.25, // £/kg - Sulphur
};

// You can extend this with seasonal variations or API integration
export const getPriceForNutrient = (nutrient) => {
  return FERTILISER_PRICES[nutrient] || 0;
};

// Calculate total value of nutrients
export const calculateNutrientValue = (nutrients) => {
  return Object.entries(nutrients).reduce((total, [nutrient, amount]) => {
    return total + (amount * (FERTILISER_PRICES[nutrient] || 0));
  }, 0);
};