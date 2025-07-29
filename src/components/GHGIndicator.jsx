import React, { useState } from 'react';
import { Cloud, Info, TrendingDown, TrendingUp, HelpCircle } from 'lucide-react';
import { estimateGHGfromNUE, categorizeGHGPerformance } from '../utils/ghgEstimation';

export default function GHGIndicator({ nue, measured = null, system = 'mixed', showDetails = false }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Use measured value if available, otherwise estimate from NUE
  const ghgData = measured || estimateGHGfromNUE(nue, system);
  const isEstimated = !measured;
  
  const performance = categorizeGHGPerformance(ghgData.value);
  
  // Color classes based on performance
  const colorClasses = {
    green: 'bg-green-50 border-green-300 text-green-800',
    blue: 'bg-blue-50 border-blue-300 text-blue-800',
    yellow: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    orange: 'bg-orange-50 border-orange-300 text-orange-800',
  };
  
  const iconColorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
  };
  
  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[performance.color]} relative`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Cloud className={`w-8 h-8 ${iconColorClasses[performance.color]}`} />
          <div>
            <h3 className="font-bold text-lg">
              GHG Intensity
              {isEstimated && (
                <span className="text-sm font-normal ml-2">(Estimated)</span>
              )}
            </h3>
            <p className="text-2xl font-bold">
              {ghgData.value} kg CO₂-eq/L
            </p>
            {showDetails && (
              <p className="text-sm mt-1">
                {performance.category} - {performance.description}
              </p>
            )}
          </div>
        </div>
        
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      
      {isEstimated && ghgData.confidence && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <div className="flex items-center justify-between text-sm">
            <span>Confidence: {ghgData.confidence}</span>
            <span>±{ghgData.se} kg CO₂-eq/L</span>
          </div>
          {showDetails && (
            <div className="mt-2 text-xs">
              95% CI: {ghgData.lower95} - {ghgData.upper95} kg CO₂-eq/L
            </div>
          )}
        </div>
      )}
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl p-4 z-10 border border-gray-200">
          <h4 className="font-semibold mb-2">
            {isEstimated ? 'How we estimate GHG from NUE' : 'About GHG Intensity'}
          </h4>
          {isEstimated ? (
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                This estimate is based on your farm's Nitrogen Use Efficiency (NUE) of {nue}%.
              </p>
              <p>
                Research shows that farms with higher NUE typically have lower GHG emissions,
                as surplus nitrogen is a key driver of N₂O emissions.
              </p>
              <p>
                The relationship has an R² of {(ghgData.r2 * 100).toFixed(0)}% for {system} systems.
              </p>
              <p className="font-medium">
                Upload measured GHG data for more accurate values.
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                GHG intensity measures the carbon footprint of milk production,
                including methane from cows, N₂O from fields, and embedded emissions.
              </p>
              <p>
                Lower values indicate more climate-efficient production.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for dashboard
export function GHGPill({ nue, measured = null, system = 'mixed' }) {
  const ghgData = measured || estimateGHGfromNUE(nue, system);
  const isEstimated = !measured;
  const performance = categorizeGHGPerformance(ghgData.value);
  
  const bgColors = {
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    yellow: 'bg-yellow-100',
    orange: 'bg-orange-100',
  };
  
  const textColors = {
    green: 'text-green-800',
    blue: 'text-blue-800',
    yellow: 'text-yellow-800',
    orange: 'text-orange-800',
  };
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${bgColors[performance.color]} ${textColors[performance.color]}`}>
      <Cloud className="w-4 h-4" />
      <span className="font-medium">
        {ghgData.value} kg CO₂/L
      </span>
      {isEstimated && (
        <span className="text-xs opacity-75">(est)</span>
      )}
    </div>
  );
}