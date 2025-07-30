import { tToKg } from './units';
import { KILL_OUT_RATIO, N_IN_CARCASS, P_IN_CARCASS } from '../constants/livestock';

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
    // All inputs are now in tonnes, convert to kg
    const amountKg = tToKg(amount);
    
    // For feeds, convert CP to N (CP / 6.25)
    let nContent = input.nContent || 0;
    if (input.cpContent && !input.source?.includes('fertiliser')) {
      nContent = (input.cpContent || 0) / 6.25;
    }
    
    const nAmount = (amountKg * nContent) / 100;
    const pAmount = (amountKg * (input.pContent || 0)) / 100;
    const kAmount = (amountKg * (input.kContent || 0)) / 100;
    const sAmount = (amountKg * (input.sContent || 0)) / 100;
    
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
      // Livestock outputs - now using number and average weight
      if (output.number && output.avgWeightKg) {
        // Convert live-weight to carcass weight
        const carcassKg = output.number * output.avgWeightKg * KILL_OUT_RATIO;
        const livestockN = carcassKg * N_IN_CARCASS;
        const livestockP = carcassKg * P_IN_CARCASS;
        totalOutputs.N += livestockN;
        totalOutputs.P += livestockP;
      } else {
        // Legacy calculation for backwards compatibility
        const livestockN = (amount * 1 * (output.nContent || 0)) / 100;
        const livestockP = (amount * 1 * (output.pContent || 0)) / 100;
        totalOutputs.N += livestockN;
        totalOutputs.P += livestockP;
      }
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