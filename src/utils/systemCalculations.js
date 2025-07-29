// Calculate system-wide metrics from KOUs and pathways

/**
 * Calculate system-wide nutrient balance and efficiency
 * @param {Object} kous - Key Operational Units
 * @param {Array} pathways - Nutrient pathways
 * @returns {Object} - System metrics including NUE
 */
export function calculateSystemBalance(kous, pathways) {
  // Initialize totals
  const inputs = { N: 0, P: 0, K: 0, S: 0 };
  const outputs = { N: 0, P: 0, K: 0, S: 0 };
  
  // Find external inputs (from external sources to farm)
  pathways.forEach(pathway => {
    const fromKOU = kous[pathway.from];
    const toKOU = kous[pathway.to];
    
    // External inputs
    if (fromKOU?.type === 'external' && toKOU && toKOU.type !== 'external') {
      Object.entries(pathway.nutrients || {}).forEach(([nutrient, amount]) => {
        inputs[nutrient] = (inputs[nutrient] || 0) + amount;
      });
    }
    
    // External outputs (from farm to external)
    if (toKOU?.type === 'output' || toKOU?.type === 'external') {
      if (fromKOU && fromKOU.type !== 'external') {
        Object.entries(pathway.nutrients || {}).forEach(([nutrient, amount]) => {
          outputs[nutrient] = (outputs[nutrient] || 0) + amount;
        });
      }
    }
    
    // Special case for atmosphere (losses)
    if (pathway.to === 'atmosphere') {
      Object.entries(pathway.nutrients || {}).forEach(([nutrient, amount]) => {
        outputs[nutrient] = (outputs[nutrient] || 0) + amount;
      });
    }
  });
  
  // Calculate efficiency metrics
  const nEfficiency = inputs.N > 0 ? (outputs.N / inputs.N) * 100 : 0;
  const pEfficiency = inputs.P > 0 ? (outputs.P / inputs.P) * 100 : 0;
  
  // Calculate balances
  const balance = {
    N: inputs.N - outputs.N,
    P: inputs.P - outputs.P,
    K: inputs.K - outputs.K,
    S: inputs.S - outputs.S,
  };
  
  // Calculate total farm area
  const totalArea = Object.values(kous)
    .filter(kou => kou.type === 'field')
    .reduce((sum, field) => sum + (field.properties?.area || 0), 0);
  
  // Calculate organic N per hectare (for NVZ compliance)
  const organicN = pathways
    .filter(p => p.type === 'manure_application')
    .reduce((sum, p) => sum + (p.nutrients?.N || 0), 0);
  
  const organicNPerHa = totalArea > 0 ? organicN / totalArea : 0;
  const nvzCompliant = organicNPerHa <= 170;
  
  // Count livestock
  const totalLivestock = Object.values(kous)
    .filter(kou => kou.type === 'livestock_group')
    .reduce((sum, group) => sum + (group.properties?.animalCount || 0), 0);
  
  return {
    inputs,
    outputs,
    balance,
    nEfficiency,
    pEfficiency,
    totalArea,
    totalLivestock,
    organicNPerHa,
    nvzCompliant,
  };
}

/**
 * Calculate productive outputs only (excluding losses)
 * @param {Object} kous - Key Operational Units
 * @param {Array} pathways - Nutrient pathways
 * @returns {Object} - Productive outputs by nutrient
 */
export function calculateProductiveOutputs(kous, pathways) {
  const productiveOutputs = { N: 0, P: 0, K: 0, S: 0 };
  
  pathways.forEach(pathway => {
    const toKOU = kous[pathway.to];
    
    // Only count outputs that are sales (milk, meat, crops)
    if (toKOU?.type === 'output' && pathway.type === 'sale') {
      Object.entries(pathway.nutrients || {}).forEach(([nutrient, amount]) => {
        productiveOutputs[nutrient] = (productiveOutputs[nutrient] || 0) + amount;
      });
    }
  });
  
  return productiveOutputs;
}

/**
 * Get system type based on KOU composition
 * @param {Object} kous - Key Operational Units
 * @returns {string} - 'grazing', 'housed', or 'mixed'
 */
export function determineSystemType(kous) {
  const fields = Object.values(kous).filter(k => k.type === 'field');
  const livestock = Object.values(kous).filter(k => k.type === 'livestock_group');
  const feedStores = Object.values(kous).filter(k => k.type === 'feed_store');
  
  if (fields.length === 0) return 'housed';
  if (feedStores.length === 0 || feedStores.every(s => s.properties?.currentStock < 100)) return 'grazing';
  
  // Check grazing pathways
  const grazingPathways = Object.values(kous).some(k => 
    k.type === 'field' && k.properties?.use === 'permanent_pasture'
  );
  
  return grazingPathways ? 'mixed' : 'housed';
}