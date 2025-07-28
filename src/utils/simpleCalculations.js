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
  
  // Sum up feed and fertilizer inputs
  inputs.forEach(input => {
    const amount = input.amount || 0;
    const multiplier = input.source?.includes('fertiliser') ? 1 : 1000; // kg for fertilizer, tonnes to kg for feed
    
    // For feeds, convert CP to N (CP / 6.25)
    let nContent = input.nContent || 0;
    if (input.cpContent && !input.source?.includes('fertiliser')) {
      nContent = (input.cpContent || 0) / 6.25;
    }
    
    totalInputs.N += (amount * multiplier * nContent) / 100;
    totalInputs.P += (amount * multiplier * (input.pContent || 0)) / 100;
    totalInputs.K += (amount * multiplier * (input.kContent || 0)) / 100;
    totalInputs.S += (amount * multiplier * (input.sContent || 0)) / 100;
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
    const multiplier = output.type === 'milk' ? 1000 : 1; // tonnes to kg for milk, kg for livestock
    
    if (output.type === 'milk') {
      // Calculate milk N from CP% (CP / 6.25)
      const milkCPpct = farmInfo.milkCPpct || 3.2;
      const milkN = amount * 1000 * (milkCPpct / 100) * 0.16; // tonnes -> kg, CP% -> N
      const milkP = amount * 1000 * 0.0009; // 0.9 g/L = 0.9 kg/m³
      totalOutputs.N += milkN;
      totalOutputs.P += milkP;
    } else {
      totalOutputs.N += (amount * multiplier * (output.nContent || 0)) / 100;
      totalOutputs.P += (amount * multiplier * (output.pContent || 0)) / 100;
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
  
  // Calculate efficiency
  const nEfficiency = totalInputs.N > 0 ? (totalOutputs.N / totalInputs.N) * 100 : 0;
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