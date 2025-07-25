import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Package, Beaker, TreePine, Milk, AlertTriangle, CheckCircle, Info, Plus, ArrowRight, Settings } from 'lucide-react';
import { 
  KOU_TYPES, 
  FIELD_USE_TYPES, 
  LIVESTOCK_GROUPS,
  PATHWAY_TYPES,
  createKOU, 
  createPathway,
  createFarmKOUStructure,
  calculateKOUBalance 
} from '../data/kouStructure';
import NutrientPathwaysView from './NutrientPathwaysView';
import FarmNutrientMap from './FarmNutrientMap';
import ScenarioPlanning from './ScenarioPlanning';

const HighResolutionNutrientBudget = () => {
  const [selectedFarmId, setSelectedFarmId] = useState('FARM-001');
  const [activeView, setActiveView] = useState('overview');
  const [selectedKOU, setSelectedKOU] = useState(null);
  const [kous, setKous] = useState({});
  const [pathways, setPathways] = useState([]);
  const [selectedNutrient, setSelectedNutrient] = useState('N');

  // Initialize KOU structure
  useEffect(() => {
    const { kous: initialKous, pathways: initialPathways } = createFarmKOUStructure({ id: selectedFarmId });
    setKous(initialKous);
    
    // Create comprehensive example pathways
    const examplePathways = [
      // External inputs
      createPathway('feed_supplier', 'conc_store', PATHWAY_TYPES.PURCHASE, { N: 5000, P: 800, K: 1200, S: 600 }),
      createPathway('fertilizer_supplier', 'field_3', PATHWAY_TYPES.FERTILIZER_APPLICATION, { N: 800, P: 150, K: 300, S: 100 }),
      createPathway('fertilizer_supplier', 'field_4', PATHWAY_TYPES.FERTILIZER_APPLICATION, { N: 600, P: 100, K: 250, S: 80 }),
      
      // Feed to livestock groups
      createPathway('silage_clamp_1', 'herd_high', PATHWAY_TYPES.FEEDING, { N: 2500, P: 400, K: 2000, S: 250 }),
      createPathway('silage_clamp_1', 'herd_mid', PATHWAY_TYPES.FEEDING, { N: 2000, P: 320, K: 1600, S: 200 }),
      createPathway('maize_clamp', 'herd_high', PATHWAY_TYPES.FEEDING, { N: 1800, P: 300, K: 1500, S: 180 }),
      createPathway('maize_clamp', 'herd_mid', PATHWAY_TYPES.FEEDING, { N: 1500, P: 250, K: 1200, S: 150 }),
      createPathway('conc_store', 'herd_high', PATHWAY_TYPES.FEEDING, { N: 3200, P: 500, K: 800, S: 400 }),
      createPathway('conc_store', 'herd_mid', PATHWAY_TYPES.FEEDING, { N: 2400, P: 380, K: 600, S: 300 }),
      createPathway('conc_store', 'herd_low', PATHWAY_TYPES.FEEDING, { N: 1600, P: 250, K: 400, S: 200 }),
      createPathway('conc_store', 'dry_cows', PATHWAY_TYPES.FEEDING, { N: 800, P: 120, K: 200, S: 100 }),
      
      // Grazing
      createPathway('field_1', 'herd_high', PATHWAY_TYPES.GRAZING, { N: 800, P: 120, K: 600, S: 80 }),
      createPathway('field_2', 'herd_mid', PATHWAY_TYPES.GRAZING, { N: 600, P: 90, K: 450, S: 60 }),
      
      // Livestock to manure
      createPathway('herd_high', 'slurry_store_1', PATHWAY_TYPES.MANURE_PRODUCTION, { N: 4200, P: 800, K: 3500, S: 420 }),
      createPathway('herd_mid', 'slurry_store_1', PATHWAY_TYPES.MANURE_PRODUCTION, { N: 3500, P: 650, K: 2900, S: 350 }),
      createPathway('herd_low', 'slurry_store_1', PATHWAY_TYPES.MANURE_PRODUCTION, { N: 2100, P: 400, K: 1750, S: 210 }),
      createPathway('dry_cows', 'fym_heap', PATHWAY_TYPES.MANURE_PRODUCTION, { N: 900, P: 180, K: 750, S: 90 }),
      
      // Manure to fields
      createPathway('slurry_store_1', 'field_1', PATHWAY_TYPES.MANURE_APPLICATION, { N: 1500, P: 300, K: 1200, S: 150 }),
      createPathway('slurry_store_1', 'field_2', PATHWAY_TYPES.MANURE_APPLICATION, { N: 1200, P: 240, K: 1000, S: 120 }),
      createPathway('slurry_store_1', 'field_3', PATHWAY_TYPES.MANURE_APPLICATION, { N: 2000, P: 400, K: 1600, S: 200 }),
      createPathway('slurry_store_1', 'field_4', PATHWAY_TYPES.MANURE_APPLICATION, { N: 1800, P: 360, K: 1450, S: 180 }),
      createPathway('fym_heap', 'field_3', PATHWAY_TYPES.MANURE_APPLICATION, { N: 600, P: 120, K: 500, S: 60 }),
      
      // Field harvest
      createPathway('field_3', 'silage_clamp_1', PATHWAY_TYPES.HARVEST, { N: 2800, P: 450, K: 2200, S: 280 }),
      createPathway('field_4', 'maize_clamp', PATHWAY_TYPES.HARVEST, { N: 2200, P: 350, K: 1800, S: 220 }),
      
      // Outputs
      createPathway('herd_high', 'milk_output', PATHWAY_TYPES.SALE, { N: 1800, P: 350, K: 600, S: 180 }),
      createPathway('herd_mid', 'milk_output', PATHWAY_TYPES.SALE, { N: 1500, P: 290, K: 500, S: 150 }),
      createPathway('herd_low', 'milk_output', PATHWAY_TYPES.SALE, { N: 900, P: 175, K: 300, S: 90 }),
      createPathway('herd_low', 'livestock_sales', PATHWAY_TYPES.SALE, { N: 200, P: 40, K: 70, S: 20 }),
      
      // Losses (simplified)
      createPathway('field_1', 'atmosphere', PATHWAY_TYPES.ATMOSPHERIC_LOSS, { N: 150, P: 0, K: 0, S: 15 }),
      createPathway('field_2', 'atmosphere', PATHWAY_TYPES.ATMOSPHERIC_LOSS, { N: 120, P: 0, K: 0, S: 12 }),
      createPathway('slurry_store_1', 'atmosphere', PATHWAY_TYPES.ATMOSPHERIC_LOSS, { N: 500, P: 0, K: 0, S: 50 }),
    ];
    
    setPathways(examplePathways);
  }, [selectedFarmId]);

  // Get KOU icon
  const getKOUIcon = (type) => {
    switch(type) {
      case KOU_TYPES.FIELD: return MapPin;
      case KOU_TYPES.LIVESTOCK_GROUP: return '🐄';
      case KOU_TYPES.FEED_STORE: return Package;
      case KOU_TYPES.MANURE_STORE: return Beaker;
      case KOU_TYPES.OUTPUT: return '📦';
      case KOU_TYPES.EXTERNAL: return '🏭';
      default: return Settings;
    }
  };

  // Get KOU color
  const getKOUColor = (type) => {
    switch(type) {
      case KOU_TYPES.FIELD: return 'bg-green-100 border-green-300 text-green-800';
      case KOU_TYPES.LIVESTOCK_GROUP: return 'bg-blue-100 border-blue-300 text-blue-800';
      case KOU_TYPES.FEED_STORE: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case KOU_TYPES.MANURE_STORE: return 'bg-orange-100 border-orange-300 text-orange-800';
      case KOU_TYPES.OUTPUT: return 'bg-purple-100 border-purple-300 text-purple-800';
      case KOU_TYPES.EXTERNAL: return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  // Overview View - Shows all KOUs
  const OverviewView = () => {
    const kousByType = Object.values(kous).reduce((acc, kou) => {
      if (!acc[kou.type]) acc[kou.type] = [];
      acc[kou.type].push(kou);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Farm System Overview - Key Operational Units</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Fields */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Fields ({kousByType[KOU_TYPES.FIELD]?.length || 0})
              </h3>
              <div className="space-y-2">
                {kousByType[KOU_TYPES.FIELD]?.map(kou => (
                  <div
                    key={kou.id}
                    onClick={() => setSelectedKOU(kou)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getKOUColor(kou.type)}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{kou.name}</div>
                        <div className="text-xs opacity-75">
                          {kou.properties.area} ha • {kou.properties.use?.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Livestock Groups */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">🐄</span>
                Livestock Groups ({kousByType[KOU_TYPES.LIVESTOCK_GROUP]?.length || 0})
              </h3>
              <div className="space-y-2">
                {kousByType[KOU_TYPES.LIVESTOCK_GROUP]?.map(kou => (
                  <div
                    key={kou.id}
                    onClick={() => setSelectedKOU(kou)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getKOUColor(kou.type)}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{kou.name}</div>
                        <div className="text-xs opacity-75">
                          {kou.properties.animalCount} head
                          {kou.properties.milkYield > 0 && ` • ${kou.properties.milkYield}L/cow/yr`}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed Stores */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <Package className="w-5 h-5 text-yellow-600" />
                Feed Stores ({kousByType[KOU_TYPES.FEED_STORE]?.length || 0})
              </h3>
              <div className="space-y-2">
                {kousByType[KOU_TYPES.FEED_STORE]?.map(kou => (
                  <div
                    key={kou.id}
                    onClick={() => setSelectedKOU(kou)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getKOUColor(kou.type)}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{kou.name}</div>
                        <div className="text-xs opacity-75">
                          {kou.properties.currentStock}t / {kou.properties.capacity}t
                          {kou.properties.feedAnalysis && ` • ${kou.properties.feedAnalysis.CP}% CP`}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manure Stores */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <Beaker className="w-5 h-5 text-orange-600" />
                Manure Stores ({kousByType[KOU_TYPES.MANURE_STORE]?.length || 0})
              </h3>
              <div className="space-y-2">
                {kousByType[KOU_TYPES.MANURE_STORE]?.map(kou => (
                  <div
                    key={kou.id}
                    onClick={() => setSelectedKOU(kou)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getKOUColor(kou.type)}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{kou.name}</div>
                        <div className="text-xs opacity-75">
                          {kou.properties.currentStock}m³ / {kou.properties.capacity}m³
                          {kou.properties.nutrientContent && ` • ${kou.properties.nutrientContent.N} kg N/m³`}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrient Flow Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Nutrient Flow Summary</h3>
            <div className="flex gap-2">
              {['N', 'P', 'K', 'S'].map(nutrient => (
                <button
                  key={nutrient}
                  onClick={() => setSelectedNutrient(nutrient)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    selectedNutrient === nutrient 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {nutrient}
                </button>
              ))}
            </div>
          </div>

          {/* Simple pathway visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pathways.slice(0, 6).map(pathway => {
              const fromKOU = kous[pathway.from];
              const toKOU = kous[pathway.to];
              return (
                <div key={pathway.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium text-gray-700">{fromKOU?.name || pathway.from}</div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="font-medium text-gray-700">{toKOU?.name || pathway.to}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {selectedNutrient}: {pathway.nutrients[selectedNutrient]} kg/yr
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {pathway.type.replace(/_/g, ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // KOU Detail View
  const KOUDetailView = () => {
    if (!selectedKOU) return null;

    const balance = calculateKOUBalance(selectedKOU, pathways);
    const incomingPathways = pathways.filter(p => p.to === selectedKOU.id);
    const outgoingPathways = pathways.filter(p => p.from === selectedKOU.id);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedKOU(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold text-gray-900">{selectedKOU.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${getKOUColor(selectedKOU.type)}`}>
                {selectedKOU.type.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* KOU Properties */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {selectedKOU.properties.area && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Area</div>
                <div className="text-2xl font-bold text-gray-900">{selectedKOU.properties.area} ha</div>
              </div>
            )}
            {selectedKOU.properties.animalCount && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Animal Count</div>
                <div className="text-2xl font-bold text-gray-900">{selectedKOU.properties.animalCount}</div>
              </div>
            )}
            {selectedKOU.properties.capacity && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Storage Capacity</div>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedKOU.properties.currentStock} / {selectedKOU.properties.capacity}
                  {selectedKOU.type === KOU_TYPES.MANURE_STORE ? ' m³' : ' t'}
                </div>
              </div>
            )}
          </div>

          {/* Nutrient Balance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(balance).map(([nutrient, data]) => (
              <div key={nutrient} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">{nutrient} Balance</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">In:</span>
                    <span className="font-medium text-green-600">+{data.inputs.toFixed(0)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Out:</span>
                    <span className="font-medium text-red-600">-{data.outputs.toFixed(0)} kg</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-gray-600">Net:</span>
                    <span className={`font-bold ${data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.balance >= 0 ? '+' : ''}{data.balance.toFixed(0)} kg
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pathways */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Inputs</h3>
              <div className="space-y-2">
                {incomingPathways.map(pathway => (
                  <div key={pathway.id} className="bg-green-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          From: {kous[pathway.from]?.name || pathway.from}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {pathway.type.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>N: {pathway.nutrients.N} kg</div>
                        <div>P: {pathway.nutrients.P} kg</div>
                      </div>
                    </div>
                  </div>
                ))}
                {incomingPathways.length === 0 && (
                  <div className="text-gray-500 text-sm">No inputs</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-3">Outputs</h3>
              <div className="space-y-2">
                {outgoingPathways.map(pathway => (
                  <div key={pathway.id} className="bg-red-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          To: {kous[pathway.to]?.name || pathway.to}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {pathway.type.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>N: {pathway.nutrients.N} kg</div>
                        <div>P: {pathway.nutrients.P} kg</div>
                      </div>
                    </div>
                  </div>
                ))}
                {outgoingPathways.length === 0 && (
                  <div className="text-gray-500 text-sm">No outputs</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">High-Resolution Nutrient Budget</h1>
              <p className="text-sm text-gray-600">Key Operational Units (KOU) Analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'overview' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                System Overview
              </button>
              <button
                onClick={() => setActiveView('pathways')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'pathways' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nutrient Pathways
              </button>
              <button
                onClick={() => setActiveView('fieldmap')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'fieldmap' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Field Map
              </button>
              <button
                onClick={() => setActiveView('scenarios')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'scenarios' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Scenarios
              </button>
            </div>
          </div>
        </div>

        {/* Nutrient Selector for Pathways and Field Map Views */}
        {(activeView === 'pathways' || activeView === 'fieldmap') && !selectedKOU && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Select Nutrient to Visualize</h3>
              <div className="flex gap-2">
                {['N', 'P', 'K', 'S'].map(nutrient => (
                  <button
                    key={nutrient}
                    onClick={() => setSelectedNutrient(nutrient)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedNutrient === nutrient 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {nutrient}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {selectedKOU ? (
          <KOUDetailView />
        ) : activeView === 'pathways' ? (
          <NutrientPathwaysView 
            kous={kous} 
            pathways={pathways} 
            selectedNutrient={selectedNutrient} 
          />
        ) : activeView === 'fieldmap' ? (
          <FarmNutrientMap
            kous={kous}
            pathways={pathways}
            selectedNutrient={selectedNutrient}
          />
        ) : activeView === 'scenarios' ? (
          <ScenarioPlanning
            kous={kous}
            pathways={pathways}
          />
        ) : (
          <OverviewView />
        )}
      </div>
    </div>
  );
};

export default HighResolutionNutrientBudget;