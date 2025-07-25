import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Calculator, Save, Copy, Trash2, Plus, TrendingUp, TrendingDown, DollarSign, Leaf, Droplets, Activity, AlertTriangle, Info } from 'lucide-react';

const ScenarioPlanning = ({ kous, pathways, onUpdateScenario }) => {
  const [scenarios, setScenarios] = useState({
    baseline: {
      name: 'Current State',
      pathways: [...pathways],
      changes: [],
      timestamp: new Date().toISOString()
    }
  });
  const [activeScenario, setActiveScenario] = useState('baseline');
  const [showNewScenarioModal, setShowNewScenarioModal] = useState(false);
  const [selectedChange, setSelectedChange] = useState(null);

  // Pre-defined scenario changes
  const SCENARIO_CHANGES = [
    {
      id: 'slurry_export',
      name: 'Export Slurry to Neighbor',
      description: 'Export 25% of slurry to neighboring farm',
      category: 'manure',
      impact: (pathways) => {
        return pathways.map(p => {
          if (p.from === 'slurry_store_1' && p.type === 'manure_application') {
            return {
              ...p,
              nutrients: {
                N: p.nutrients.N * 0.75,
                P: p.nutrients.P * 0.75,
                K: p.nutrients.K * 0.75,
                S: p.nutrients.S * 0.75
              }
            };
          }
          return p;
        });
      },
      costs: { capital: 0, operational: -2000 }, // negative = income
      benefits: { nReduction: 25, compliance: true }
    },
    {
      id: 'trailing_shoe',
      name: 'Trailing Shoe Applicator',
      description: 'Reduce ammonia losses by 30% with precision application',
      category: 'equipment',
      impact: (pathways) => {
        return pathways.map(p => {
          if (p.type === 'manure_application') {
            // Add nutrients back that would have been lost
            return {
              ...p,
              nutrients: {
                N: p.nutrients.N * 1.15, // 15% more N available
                P: p.nutrients.P,
                K: p.nutrients.K,
                S: p.nutrients.S * 1.05
              }
            };
          }
          return p;
        });
      },
      costs: { capital: 15000, operational: 500 },
      benefits: { nEfficiency: 15, ghgReduction: 20 }
    },
    {
      id: 'reduce_fertilizer',
      name: 'Reduce Synthetic Fertilizer',
      description: 'Cut fertilizer use by 30% based on improved manure efficiency',
      category: 'inputs',
      impact: (pathways) => {
        return pathways.map(p => {
          if (p.from === 'fertilizer_supplier') {
            return {
              ...p,
              nutrients: {
                N: p.nutrients.N * 0.7,
                P: p.nutrients.P * 0.7,
                K: p.nutrients.K * 0.7,
                S: p.nutrients.S * 0.7
              }
            };
          }
          return p;
        });
      },
      costs: { capital: 0, operational: -3500 },
      benefits: { costSaving: 3500, carbonReduction: 10 }
    },
    {
      id: 'cover_crops',
      name: 'Plant Cover Crops',
      description: 'Add cover crops to reduce N leaching by 40%',
      category: 'practices',
      impact: (pathways) => {
        // Reduce atmospheric and leaching losses
        return pathways.map(p => {
          if (p.type === 'atmospheric_loss' || p.type === 'leaching_loss') {
            return {
              ...p,
              nutrients: {
                N: p.nutrients.N * 0.6,
                P: p.nutrients.P * 0.8,
                K: p.nutrients.K * 0.9,
                S: p.nutrients.S * 0.7
              }
            };
          }
          return p;
        });
      },
      costs: { capital: 0, operational: 2000 },
      benefits: { nRetention: 40, soilHealth: true }
    },
    {
      id: 'precision_feeding',
      name: 'Precision Feeding System',
      description: 'Optimize feed rations to reduce N excretion by 20%',
      category: 'livestock',
      impact: (pathways) => {
        return pathways.map(p => {
          if (p.type === 'manure_production') {
            return {
              ...p,
              nutrients: {
                N: p.nutrients.N * 0.8,
                P: p.nutrients.P * 0.9,
                K: p.nutrients.K,
                S: p.nutrients.S * 0.9
              }
            };
          }
          return p;
        });
      },
      costs: { capital: 8000, operational: 1000 },
      benefits: { feedEfficiency: 15, nReduction: 20 }
    },
    {
      id: 'increase_storage',
      name: 'Expand Slurry Storage',
      description: 'Add 3 months storage capacity for optimal spreading timing',
      category: 'infrastructure',
      impact: (pathways) => {
        // Better timing = better utilization
        return pathways.map(p => {
          if (p.type === 'manure_application') {
            return {
              ...p,
              nutrients: {
                N: p.nutrients.N * 1.1, // 10% better utilization
                P: p.nutrients.P * 1.05,
                K: p.nutrients.K,
                S: p.nutrients.S
              }
            };
          }
          return p;
        });
      },
      costs: { capital: 45000, operational: 0 },
      benefits: { nvzCompliance: true, flexibility: true }
    }
  ];

  // Calculate scenario metrics
  const calculateScenarioMetrics = (scenarioPathways) => {
    // Total inputs and outputs
    const totalInputs = {
      N: scenarioPathways.filter(p => p.from === 'fertilizer_supplier' || p.from === 'feed_supplier')
        .reduce((sum, p) => sum + (p.nutrients.N || 0), 0),
      P: scenarioPathways.filter(p => p.from === 'fertilizer_supplier' || p.from === 'feed_supplier')
        .reduce((sum, p) => sum + (p.nutrients.P || 0), 0),
      K: scenarioPathways.filter(p => p.from === 'fertilizer_supplier' || p.from === 'feed_supplier')
        .reduce((sum, p) => sum + (p.nutrients.K || 0), 0),
      S: scenarioPathways.filter(p => p.from === 'fertilizer_supplier' || p.from === 'feed_supplier')
        .reduce((sum, p) => sum + (p.nutrients.S || 0), 0)
    };

    const totalOutputs = {
      N: scenarioPathways.filter(p => p.to === 'milk_output' || p.to === 'livestock_sales' || p.to === 'crop_sales')
        .reduce((sum, p) => sum + (p.nutrients.N || 0), 0),
      P: scenarioPathways.filter(p => p.to === 'milk_output' || p.to === 'livestock_sales' || p.to === 'crop_sales')
        .reduce((sum, p) => sum + (p.nutrients.P || 0), 0),
      K: scenarioPathways.filter(p => p.to === 'milk_output' || p.to === 'livestock_sales' || p.to === 'crop_sales')
        .reduce((sum, p) => sum + (p.nutrients.K || 0), 0),
      S: scenarioPathways.filter(p => p.to === 'milk_output' || p.to === 'livestock_sales' || p.to === 'crop_sales')
        .reduce((sum, p) => sum + (p.nutrients.S || 0), 0)
    };

    const totalLosses = {
      N: scenarioPathways.filter(p => p.to === 'atmosphere' || p.type.includes('loss'))
        .reduce((sum, p) => sum + (p.nutrients.N || 0), 0),
      P: scenarioPathways.filter(p => p.type.includes('loss'))
        .reduce((sum, p) => sum + (p.nutrients.P || 0), 0)
    };

    // Efficiency calculations
    const nEfficiency = totalInputs.N > 0 ? (totalOutputs.N / totalInputs.N) * 100 : 0;
    const pEfficiency = totalInputs.P > 0 ? (totalOutputs.P / totalInputs.P) * 100 : 0;

    // NVZ compliance check
    const organicN = scenarioPathways
      .filter(p => p.type === 'manure_application')
      .reduce((sum, p) => sum + (p.nutrients.N || 0), 0);
    const totalArea = Object.values(kous)
      .filter(k => k.type === 'field')
      .reduce((sum, k) => sum + (k.properties.area || 0), 0);
    const organicNPerHa = totalArea > 0 ? organicN / totalArea : 0;

    return {
      totalInputs,
      totalOutputs,
      totalLosses,
      nEfficiency,
      pEfficiency,
      organicNPerHa,
      nvzCompliant: organicNPerHa <= 170
    };
  };

  // Create new scenario
  const createScenario = (name, baseScenario = 'baseline') => {
    const newId = `scenario_${Date.now()}`;
    setScenarios(prev => ({
      ...prev,
      [newId]: {
        name,
        pathways: [...scenarios[baseScenario].pathways],
        changes: [],
        baseScenario,
        timestamp: new Date().toISOString()
      }
    }));
    setActiveScenario(newId);
    setShowNewScenarioModal(false);
  };

  // Apply change to scenario
  const applyChange = (changeId) => {
    const change = SCENARIO_CHANGES.find(c => c.id === changeId);
    if (!change || activeScenario === 'baseline') return;

    setScenarios(prev => {
      const scenario = prev[activeScenario];
      const updatedPathways = change.impact(scenario.pathways);
      
      return {
        ...prev,
        [activeScenario]: {
          ...scenario,
          pathways: updatedPathways,
          changes: [...scenario.changes, changeId]
        }
      };
    });
  };

  // Remove change from scenario
  const removeChange = (changeId) => {
    if (activeScenario === 'baseline') return;

    setScenarios(prev => {
      const scenario = prev[activeScenario];
      const basePathways = scenarios[scenario.baseScenario || 'baseline'].pathways;
      
      // Reapply all changes except the removed one
      const remainingChanges = scenario.changes.filter(c => c !== changeId);
      let updatedPathways = [...basePathways];
      
      remainingChanges.forEach(cId => {
        const change = SCENARIO_CHANGES.find(c => c.id === cId);
        if (change) {
          updatedPathways = change.impact(updatedPathways);
        }
      });
      
      return {
        ...prev,
        [activeScenario]: {
          ...scenario,
          pathways: updatedPathways,
          changes: remainingChanges
        }
      };
    });
  };

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    const baselineMetrics = calculateScenarioMetrics(scenarios.baseline.pathways);
    const activeMetrics = calculateScenarioMetrics(scenarios[activeScenario].pathways);
    
    return {
      baseline: baselineMetrics,
      active: activeMetrics,
      changes: {
        nEfficiency: activeMetrics.nEfficiency - baselineMetrics.nEfficiency,
        pEfficiency: activeMetrics.pEfficiency - baselineMetrics.pEfficiency,
        nInputs: activeMetrics.totalInputs.N - baselineMetrics.totalInputs.N,
        nLosses: activeMetrics.totalLosses.N - baselineMetrics.totalLosses.N,
        organicN: activeMetrics.organicNPerHa - baselineMetrics.organicNPerHa
      }
    };
  }, [scenarios, activeScenario]);

  // Calculate total costs and benefits
  const scenarioCosts = useMemo(() => {
    if (activeScenario === 'baseline') return { capital: 0, operational: 0 };
    
    const scenario = scenarios[activeScenario];
    return scenario.changes.reduce((total, changeId) => {
      const change = SCENARIO_CHANGES.find(c => c.id === changeId);
      if (change) {
        total.capital += change.costs.capital;
        total.operational += change.costs.operational;
      }
      return total;
    }, { capital: 0, operational: 0 });
  }, [scenarios, activeScenario]);

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Scenario Planning</h3>
          <button
            onClick={() => setShowNewScenarioModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Scenario
          </button>
        </div>

        {/* Scenario Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {Object.entries(scenarios).map(([id, scenario]) => (
            <div key={id} className="relative">
              <button
                onClick={() => setActiveScenario(id)}
                className={`px-4 py-2 font-medium transition-all ${
                  activeScenario === id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {scenario.name}
                {scenario.changes.length > 0 && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {scenario.changes.length}
                  </span>
                )}
              </button>
              {id !== 'baseline' && (
                <button
                  onClick={() => {
                    setScenarios(prev => {
                      const { [id]: removed, ...rest } = prev;
                      return rest;
                    });
                    setActiveScenario('baseline');
                  }}
                  className="absolute -top-1 -right-1 p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Available Changes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Available Interventions</h4>
            <div className="space-y-2">
              {SCENARIO_CHANGES.map(change => {
                const isApplied = scenarios[activeScenario].changes.includes(change.id);
                const categoryColors = {
                  manure: 'bg-orange-50 border-orange-200',
                  equipment: 'bg-blue-50 border-blue-200',
                  inputs: 'bg-green-50 border-green-200',
                  practices: 'bg-purple-50 border-purple-200',
                  livestock: 'bg-yellow-50 border-yellow-200',
                  infrastructure: 'bg-gray-50 border-gray-200'
                };
                
                return (
                  <div
                    key={change.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isApplied 
                        ? 'bg-gray-100 border-gray-300 opacity-50' 
                        : categoryColors[change.category] || 'bg-gray-50 border-gray-200'
                    } ${activeScenario === 'baseline' ? 'cursor-not-allowed' : 'hover:shadow'}`}
                    onClick={() => {
                      if (activeScenario !== 'baseline' && !isApplied) {
                        applyChange(change.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{change.name}</div>
                        <div className="text-sm text-gray-600">{change.description}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="text-gray-500">
                            Capital: £{change.costs.capital.toLocaleString()}
                          </span>
                          <span className={`font-medium ${
                            change.costs.operational < 0 ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            Annual: £{Math.abs(change.costs.operational).toLocaleString()}
                            {change.costs.operational < 0 && ' income'}
                          </span>
                        </div>
                      </div>
                      {isApplied && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeChange(change.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scenario Impact */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Scenario Impact</h4>
            
            {/* Cost Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Investment Summary</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Capital Investment</span>
                  <span className="font-bold text-gray-900">
                    £{scenarioCosts.capital.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Annual Impact</span>
                  <span className={`font-bold ${
                    scenarioCosts.operational < 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {scenarioCosts.operational < 0 ? '+' : '-'}£{Math.abs(scenarioCosts.operational).toLocaleString()}
                  </span>
                </div>
                {scenarioCosts.capital > 0 && scenarioCosts.operational < 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Simple Payback</span>
                      <span className="font-bold text-blue-600">
                        {(scenarioCosts.capital / Math.abs(scenarioCosts.operational)).toFixed(1)} years
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nutrient Impact */}
            <div className="space-y-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">N Efficiency</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {comparisonData.baseline.nEfficiency.toFixed(1)}%
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">
                      {comparisonData.active.nEfficiency.toFixed(1)}%
                    </span>
                    {comparisonData.changes.nEfficiency !== 0 && (
                      <span className={`text-sm font-medium ${
                        comparisonData.changes.nEfficiency > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({comparisonData.changes.nEfficiency > 0 ? '+' : ''}{comparisonData.changes.nEfficiency.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(comparisonData.active.nEfficiency, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Organic N Loading</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {comparisonData.active.organicNPerHa.toFixed(0)} kg/ha
                    </span>
                    {comparisonData.active.nvzCompliant ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  NVZ Limit: 170 kg/ha
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">N Losses</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {comparisonData.active.totalLosses.N.toFixed(0)} kg/year
                    </span>
                    {comparisonData.changes.nLosses !== 0 && (
                      <span className={`text-sm font-medium ${
                        comparisonData.changes.nLosses < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({comparisonData.changes.nLosses > 0 ? '+' : ''}{comparisonData.changes.nLosses.toFixed(0)} kg)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="mt-6 border-t pt-6">
          <h4 className="font-medium text-gray-800 mb-4">Scenario Comparison</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              {
                metric: 'N Efficiency (%)',
                baseline: comparisonData.baseline.nEfficiency,
                scenario: comparisonData.active.nEfficiency
              },
              {
                metric: 'P Efficiency (%)',
                baseline: comparisonData.baseline.pEfficiency,
                scenario: comparisonData.active.pEfficiency
              },
              {
                metric: 'N Inputs (t)',
                baseline: comparisonData.baseline.totalInputs.N / 1000,
                scenario: comparisonData.active.totalInputs.N / 1000
              },
              {
                metric: 'N Losses (t)',
                baseline: comparisonData.baseline.totalLosses.N / 1000,
                scenario: comparisonData.active.totalLosses.N / 1000
              }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip formatter={(value) => value.toFixed(1)} />
              <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" />
              <Bar dataKey="scenario" fill="#3b82f6" name={scenarios[activeScenario].name} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Scenario Modal */}
      {showNewScenarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Scenario</h3>
            <input
              type="text"
              placeholder="Scenario name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  createScenario(e.target.value);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewScenarioModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Scenario name"]');
                  if (input.value) {
                    createScenario(input.value);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioPlanning;