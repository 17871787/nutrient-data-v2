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