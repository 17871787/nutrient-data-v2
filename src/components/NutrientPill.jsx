import React from 'react';

const NutrientPill = ({ nutrient, value, unit = 'kg', showSign = false }) => {
  const nutrientColors = {
    N: 'bg-blue-100 text-blue-800 border-blue-200',
    P: 'bg-purple-100 text-purple-800 border-purple-200',
    K: 'bg-green-100 text-green-800 border-green-200',
    S: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const formatValue = (val) => {
    if (Math.abs(val) >= 1000) {
      return `${(val / 1000).toFixed(1)}t`;
    }
    return `${val.toFixed(0)}${unit}`;
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${nutrientColors[nutrient] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      <span className="font-bold mr-1">{nutrient}:</span>
      <span>
        {showSign && value > 0 ? '+' : ''}
        {formatValue(value)}
      </span>
    </div>
  );
};

export default NutrientPill;