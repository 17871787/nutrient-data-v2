// GHG estimation from NUE based on pilot farm regression analysis

/**
 * Estimate GHG intensity from Nitrogen Use Efficiency (NUE)
 * Based on meta-analysis showing inverse relationship (R² ≈ 0.4-0.6)
 * 
 * @param {number} nue - Nitrogen Use Efficiency as percentage (0-100)
 * @param {string} system - Farm system type ('grazing', 'housed', 'mixed')
 * @returns {object} - { value: kg CO2-eq/L, se: standard error, confidence: 'high'|'medium'|'low' }
 */
export function estimateGHGfromNUE(nue, system = 'mixed') {
  // Regression coefficients from pilot farm analysis
  // These would be calibrated from actual farm data
  const coefficients = {
    grazing: {
      intercept: 1.75,    // kg CO2-eq/L at 0% NUE
      slope: -0.014,      // reduction per % NUE
      se: 0.07,          // standard error of prediction
      r2: 0.58           // model R²
    },
    housed: {
      intercept: 1.95,
      slope: -0.011,
      se: 0.09,
      r2: 0.45
    },
    mixed: {
      intercept: 1.85,
      slope: -0.012,
      se: 0.08,
      r2: 0.52
    }
  };

  const coef = coefficients[system] || coefficients.mixed;
  
  // Calculate point estimate
  const estimate = coef.intercept + (coef.slope * nue);
  
  // Ensure non-negative
  const value = Math.max(estimate, 0.3); // Minimum realistic value
  
  // Calculate 95% confidence interval
  const ci95 = coef.se * 1.96;
  
  // Determine confidence level based on R²
  let confidence;
  if (coef.r2 > 0.55) confidence = 'high';
  else if (coef.r2 > 0.45) confidence = 'medium';
  else confidence = 'low';
  
  return {
    value: Number(value.toFixed(3)),
    se: Number(coef.se.toFixed(3)),
    lower95: Number((value - ci95).toFixed(3)),
    upper95: Number((value + ci95).toFixed(3)),
    confidence,
    r2: coef.r2,
    method: 'NUE-based regression'
  };
}

/**
 * Convert GHG intensity between units
 * @param {number} value - GHG intensity
 * @param {string} fromUnit - Source unit ('kgCO2eq/L', 'kgCO2eq/kgFPCM', 'kgCO2eq/tonne')
 * @param {string} toUnit - Target unit
 * @param {number} milkDensity - Milk density in kg/L (default 1.03)
 * @returns {number} - Converted value
 */
export function convertGHGUnit(value, fromUnit, toUnit, milkDensity = 1.03) {
  // First convert to base unit (kg CO2-eq / kg milk)
  let baseValue;
  
  switch (fromUnit) {
    case 'kgCO2eq/L':
      baseValue = value / milkDensity;
      break;
    case 'kgCO2eq/kgFPCM':
      baseValue = value;
      break;
    case 'kgCO2eq/tonne':
      baseValue = value / 1000;
      break;
    default:
      baseValue = value;
  }
  
  // Then convert to target unit
  switch (toUnit) {
    case 'kgCO2eq/L':
      return baseValue * milkDensity;
    case 'kgCO2eq/kgFPCM':
      return baseValue;
    case 'kgCO2eq/tonne':
      return baseValue * 1000;
    default:
      return baseValue;
  }
}

/**
 * Calculate GHG change from NUE change in scenario planning
 * @param {number} currentNUE - Current NUE %
 * @param {number} newNUE - Projected NUE %
 * @param {string} system - Farm system type
 * @returns {object} - { absolute: kg CO2-eq/L change, relative: % change }
 */
export function calculateGHGChange(currentNUE, newNUE, system = 'mixed') {
  const currentGHG = estimateGHGfromNUE(currentNUE, system);
  const newGHG = estimateGHGfromNUE(newNUE, system);
  
  const absoluteChange = newGHG.value - currentGHG.value;
  const relativeChange = (absoluteChange / currentGHG.value) * 100;
  
  return {
    current: currentGHG.value,
    projected: newGHG.value,
    absolute: Number(absoluteChange.toFixed(3)),
    relative: Number(relativeChange.toFixed(1)),
    confidence: newGHG.confidence
  };
}

/**
 * Categorize GHG performance
 * @param {number} ghgIntensity - kg CO2-eq/L
 * @returns {object} - { category: string, color: string, description: string }
 */
export function categorizeGHGPerformance(ghgIntensity) {
  if (ghgIntensity < 0.8) {
    return {
      category: 'Excellent',
      color: 'green',
      description: 'Top 10% - Industry leading performance'
    };
  } else if (ghgIntensity < 1.0) {
    return {
      category: 'Good',
      color: 'blue',
      description: 'Top 25% - Above average performance'
    };
  } else if (ghgIntensity < 1.2) {
    return {
      category: 'Average',
      color: 'yellow',
      description: 'Middle 50% - Room for improvement'
    };
  } else {
    return {
      category: 'Below Average',
      color: 'orange',
      description: 'Bottom 25% - Significant improvement potential'
    };
  }
}

/**
 * Get GHG reduction strategies based on NUE
 * @param {number} nue - Current NUE %
 * @returns {array} - Array of strategy objects
 */
export function getGHGReductionStrategies(nue) {
  const strategies = [];
  
  if (nue < 25) {
    strategies.push({
      priority: 'high',
      strategy: 'Improve feed efficiency',
      impact: '10-15% GHG reduction',
      description: 'Optimize feed rations to reduce N excretion'
    });
    strategies.push({
      priority: 'high',
      strategy: 'Reduce fertilizer use',
      impact: '5-10% GHG reduction',
      description: 'Better utilize organic nutrients from manure'
    });
  }
  
  if (nue < 35) {
    strategies.push({
      priority: 'medium',
      strategy: 'Improve manure management',
      impact: '5-8% GHG reduction',
      description: 'Cover stores, inject slurry, optimize timing'
    });
    strategies.push({
      priority: 'medium',
      strategy: 'Enhance grazing management',
      impact: '3-5% GHG reduction',
      description: 'Rotational grazing, clover incorporation'
    });
  }
  
  strategies.push({
    priority: 'low',
    strategy: 'Precision agriculture',
    impact: '2-4% GHG reduction',
    description: 'Variable rate application, GPS guidance'
  });
  
  return strategies;
}