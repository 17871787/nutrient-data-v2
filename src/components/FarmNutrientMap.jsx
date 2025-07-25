import React, { useState, useMemo } from 'react';
import { MapPin, Info, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { NUTRIENT_LIMITS, getNutrientStatus, getStatusColor } from '../config/nutrientLimits';

const FarmNutrientMap = ({ kous, pathways, selectedNutrient = 'N' }) => {
  const [selectedField, setSelectedField] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  // Calculate nutrient status for each field
  const fieldAnalysis = useMemo(() => {
    const fields = Object.values(kous).filter(kou => kou.type === 'field');
    
    return fields.map(field => {
      // Calculate inputs and outputs for this field
      const inputs = pathways
        .filter(p => p.to === field.id)
        .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0);
      
      const outputs = pathways
        .filter(p => p.from === field.id)
        .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0);
      
      const balance = inputs - outputs;
      const balancePerHa = field.properties.area ? balance / field.properties.area : 0;
      
      // Determine status based on balance using config
      const status = getNutrientStatus(selectedNutrient, balancePerHa);
      const statusColor = getStatusColor(status);
      
      // Get soil index from field properties (simplified)
      const soilIndex = field.properties.nutrients?.[selectedNutrient]?.index || 2;
      
      return {
        ...field,
        inputs,
        outputs,
        balance,
        balancePerHa,
        status,
        statusColor,
        soilIndex
      };
    });
  }, [kous, pathways, selectedNutrient]);

  // Create a simple grid layout for fields
  const getFieldPosition = (index, total) => {
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    return { row, col };
  };

  // Field component
  const FieldBlock = ({ field, index, total }) => {
    const position = getFieldPosition(index, total);
    const isSelected = selectedField?.id === field.id;
    
    return (
      <div
        className={`absolute transition-all duration-300 ${
          isSelected ? 'z-10 transform scale-110' : 'hover:z-5 hover:transform hover:scale-105'
        }`}
        style={{
          left: `${position.col * 120 + 20}px`,
          top: `${position.row * 120 + 20}px`,
          width: '100px',
          height: '100px'
        }}
        onClick={() => setSelectedField(field)}
      >
        <div
          className={`w-full h-full rounded-lg border-2 cursor-pointer shadow-md ${
            isSelected ? 'border-gray-800 shadow-xl' : 'border-gray-400'
          }`}
          style={{ backgroundColor: field.statusColor }}
        >
          <div className="p-2 h-full flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white">{field.name}</div>
              <div className="text-xs text-white opacity-90">{field.properties.area} ha</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {field.balancePerHa > 0 ? '+' : ''}{field.balancePerHa.toFixed(0)}
              </div>
              <div className="text-xs text-white opacity-90">kg/ha</div>
            </div>
          </div>
        </div>
        <div className="text-center mt-1">
          <span className="text-xs text-gray-600">{field.properties.use?.replace(/_/g, ' ')}</span>
        </div>
      </div>
    );
  };

  // Status legend
  const StatusLegend = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <h4 className="font-medium text-gray-800 mb-3">Nutrient Status</h4>
      <div className="space-y-2">
        {selectedNutrient === 'N' && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor('non-compliant') }} />
            <span className="text-sm text-gray-600">Non-compliant (Above NVZ limit)</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor('excess') }} />
          <span className="text-sm text-gray-600">Excess (Above recommended)</span>
        </div>
        {selectedNutrient === 'N' && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor('warning') }} />
            <span className="text-sm text-gray-600">Warning (Approaching limit)</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor('high') }} />
          <span className="text-sm text-gray-600">High (Near upper limit)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor('optimal') }} />
          <span className="text-sm text-gray-600">Optimal (Within target range)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor('low') }} />
          <span className="text-sm text-gray-600">Low (Below target)</span>
        </div>
      </div>
      
      <h4 className="font-medium text-gray-800 mb-3 mt-4">Limits for {selectedNutrient}</h4>
      <div className="text-xs text-gray-600 space-y-1">
        {selectedNutrient === 'N' && (
          <>
            <div>Non-compliant: &gt;{NUTRIENT_LIMITS.N.nvzLimit} kg/ha (NVZ limit)</div>
            <div>Warning: {NUTRIENT_LIMITS.N.warningThreshold}-{NUTRIENT_LIMITS.N.nvzLimit} kg/ha</div>
            <div>High: {NUTRIENT_LIMITS.N.highThreshold}-{NUTRIENT_LIMITS.N.warningThreshold} kg/ha</div>
            <div>Optimal: {NUTRIENT_LIMITS.N.optimalMin}-{NUTRIENT_LIMITS.N.optimalMax} kg/ha</div>
            <div>Low: &lt;{NUTRIENT_LIMITS.N.optimalMin} kg/ha</div>
          </>
        )}
        {selectedNutrient === 'P' && (
          <>
            <div>Excess: &gt;{NUTRIENT_LIMITS.P.excessThreshold} kg/ha</div>
            <div>High: {NUTRIENT_LIMITS.P.highThreshold}-{NUTRIENT_LIMITS.P.excessThreshold} kg/ha</div>
            <div>Optimal: {NUTRIENT_LIMITS.P.optimalMin}-{NUTRIENT_LIMITS.P.optimalMax} kg/ha</div>
            <div>Low: &lt;{NUTRIENT_LIMITS.P.optimalMin} kg/ha</div>
          </>
        )}
        {selectedNutrient === 'K' && (
          <>
            <div>Excess: &gt;{NUTRIENT_LIMITS.K.excessThreshold} kg/ha</div>
            <div>High: {NUTRIENT_LIMITS.K.highThreshold}-{NUTRIENT_LIMITS.K.excessThreshold} kg/ha</div>
            <div>Optimal: {NUTRIENT_LIMITS.K.optimalMin}-{NUTRIENT_LIMITS.K.optimalMax} kg/ha</div>
            <div>Low: &lt;{NUTRIENT_LIMITS.K.optimalMin} kg/ha</div>
          </>
        )}
        {selectedNutrient === 'S' && (
          <>
            <div>Excess: &gt;{NUTRIENT_LIMITS.S.excessThreshold} kg/ha</div>
            <div>High: {NUTRIENT_LIMITS.S.highThreshold}-{NUTRIENT_LIMITS.S.excessThreshold} kg/ha</div>
            <div>Optimal: {NUTRIENT_LIMITS.S.optimalMin}-{NUTRIENT_LIMITS.S.optimalMax} kg/ha</div>
            <div>Low: &lt;{NUTRIENT_LIMITS.S.optimalMin} kg/ha</div>
          </>
        )}
      </div>
    </div>
  );

  // Field details panel
  const FieldDetails = ({ field }) => (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="font-bold text-gray-900 mb-3">{field.name}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600">Area</div>
          <div className="font-bold text-gray-900">{field.properties.area} ha</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Use Type</div>
          <div className="font-bold text-gray-900 capitalize">
            {field.properties.use?.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-50 rounded p-3">
          <div className="text-sm text-gray-600 mb-1">{selectedNutrient} Balance</div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">Total: </span>
              <span className={`font-bold ${field.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {field.balance >= 0 ? '+' : ''}{field.balance.toFixed(0)} kg
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Per ha: </span>
              <span className={`font-bold ${field.balancePerHa >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {field.balancePerHa >= 0 ? '+' : ''}{field.balancePerHa.toFixed(0)} kg/ha
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 rounded p-2">
            <div className="text-xs text-gray-600">Inputs</div>
            <div className="font-bold text-green-600">{field.inputs.toFixed(0)} kg</div>
          </div>
          <div className="bg-red-50 rounded p-2">
            <div className="text-xs text-gray-600">Outputs</div>
            <div className="font-bold text-red-600">{field.outputs.toFixed(0)} kg</div>
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${
          field.status === 'excess' ? 'bg-red-50 border-red-200' :
          field.status === 'high' ? 'bg-amber-50 border-amber-200' :
          field.status === 'low' ? 'bg-blue-50 border-blue-200' :
          'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            {field.status === 'excess' && <AlertTriangle className="w-4 h-4 text-red-600" />}
            {field.status === 'optimal' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {field.status === 'high' && <TrendingUp className="w-4 h-4 text-amber-600" />}
            {field.status === 'low' && <TrendingDown className="w-4 h-4 text-blue-600" />}
            <span className="font-medium text-gray-900 capitalize">
              {field.status} {selectedNutrient} Status
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {field.status === 'excess' && 'Consider reducing inputs or exporting nutrients'}
            {field.status === 'high' && 'Monitor closely to avoid exceeding limits'}
            {field.status === 'optimal' && 'Within recommended range'}
            {field.status === 'low' && 'May need additional nutrient inputs'}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Soil {selectedNutrient} Index: {field.soilIndex}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Farm Nutrient Map - {selectedNutrient}
          </h3>
          <p className="text-sm text-gray-600">
            Visual representation of nutrient status across all fields
          </p>
        </div>
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {showLegend ? 'Hide' : 'Show'} Legend
        </button>
      </div>

      <div className="flex gap-6">
        {/* Map Area */}
        <div className="flex-1">
          <div className="relative bg-gray-100 rounded-lg p-4" style={{ height: '500px' }}>
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white px-3 py-1 rounded shadow">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Farm Overview</span>
            </div>
            
            {/* Field blocks */}
            {fieldAnalysis.map((field, index) => (
              <FieldBlock
                key={field.id}
                field={field}
                index={index}
                total={fieldAnalysis.length}
              />
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600">Total Fields</div>
              <div className="text-xl font-bold text-gray-900">{fieldAnalysis.length}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xs text-gray-600">Excess Status</div>
              <div className="text-xl font-bold text-red-600">
                {fieldAnalysis.filter(f => f.status === 'excess').length}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-gray-600">Optimal Status</div>
              <div className="text-xl font-bold text-green-600">
                {fieldAnalysis.filter(f => f.status === 'optimal').length}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-gray-600">Low Status</div>
              <div className="text-xl font-bold text-blue-600">
                {fieldAnalysis.filter(f => f.status === 'low').length}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 space-y-4">
          {showLegend && <StatusLegend />}
          {selectedField && <FieldDetails field={selectedField} />}
          {!selectedField && !showLegend && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click on a field to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmNutrientMap;