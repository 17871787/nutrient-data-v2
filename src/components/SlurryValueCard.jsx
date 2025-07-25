import React, { useMemo } from 'react';
import { Droplets, PoundSterling, TrendingUp, Info } from 'lucide-react';
import { calculateKOUBalance } from '../data/kouStructure';
import { FERTILISER_PRICES } from '../constants/prices';
import NutrientPill from './NutrientPill';

export default function SlurryValueCard({ kous, pathways }) {
  // Find all manure stores
  const manureStores = useMemo(() => {
    console.log('All KOUs:', kous);
    const stores = Object.values(kous).filter(k => k.type === 'manure_store');
    console.log('Found manure stores:', stores);
    return stores;
  }, [kous]);

  // Calculate total value across all manure stores
  const totalValueData = useMemo(() => {
    let totalValue = 0;
    let totalNutrients = { N: 0, P: 0, K: 0, S: 0 };
    
    manureStores.forEach(store => {
      const balance = calculateKOUBalance(store, pathways);
      
      // Only count positive balances (what's actually in storage)
      Object.entries(balance).forEach(([nutrient, data]) => {
        if (data.balance > 0) {
          totalNutrients[nutrient] = (totalNutrients[nutrient] || 0) + data.balance;
          totalValue += data.balance * (FERTILISER_PRICES[nutrient] || 0);
        }
      });
    });

    return { totalValue, totalNutrients };
  }, [manureStores, pathways]);

  const { totalValue, totalNutrients } = totalValueData;

  // Calculate potential savings percentage (vs buying all nutrients)
  const totalNutrientWeight = Object.values(totalNutrients).reduce((sum, val) => sum + val, 0);
  const savingsPercentage = totalNutrientWeight > 0 ? 100 : 0; // 100% savings if using manure vs buying

  if (manureStores.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-md p-6 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-600 text-white rounded-lg">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manure Nutrient Value</h2>
            <p className="text-sm text-gray-600">Fertiliser replacement value</p>
          </div>
        </div>
        <div className="group relative">
          <Info className="h-5 w-5 text-gray-400 cursor-help" />
          <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            Based on current fertiliser prices: N £{FERTILISER_PRICES.N}/kg, P £{FERTILISER_PRICES.P}/kg, K £{FERTILISER_PRICES.K}/kg
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <PoundSterling className="h-8 w-8 text-green-700" />
        <span className="text-4xl font-extrabold text-green-700">
          {totalValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
        </span>
        <span className="text-lg text-gray-600">value</span>
      </div>

      {savingsPercentage > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-medium">
            {savingsPercentage.toFixed(0)}% saving vs purchased fertiliser
          </span>
        </div>
      )}

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Nutrients in storage:</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(totalNutrients).map(([nutrient, amount]) => (
            amount > 0 && (
              <NutrientPill 
                key={nutrient} 
                nutrient={nutrient} 
                value={amount} 
              />
            )
          ))}
        </div>
      </div>

      {manureStores.length > 1 && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <div className="text-xs text-gray-600">
            Across {manureStores.length} storage facilities
          </div>
        </div>
      )}
    </div>
  );
}