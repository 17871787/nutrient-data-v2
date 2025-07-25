# Complete Nutrient Data Advanced Codebase - Part 3

## 13. src/components/ScenarioPlanning.jsx

```jsx
import React, { useState, useMemo } from 'react';
import { Calculator, Plus, Trash2, Copy, AlertTriangle, CheckCircle, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { KOU_TYPES, PATHWAY_TYPES, createPathway } from '../data/kouStructure';

const ScenarioPlanning = ({ kous, pathways }) => {
  const [scenarios, setScenarios] = useState([
    {
      id: 'baseline',
      name: 'Current Baseline',
      description: 'Current farm nutrient management',
      isBaseline: true,
      modifications: []
    }
  ]);
  const [activeScenarioId, setActiveScenarioId] = useState('baseline');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');

  // Get active scenario
  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  // Apply scenario modifications to pathways
  const getScenarioPathways = (scenario) => {
    if (scenario.isBaseline) return pathways;
    
    let modifiedPathways = [...pathways];
    
    scenario.modifications.forEach(mod => {
      switch (mod.type) {
        case 'adjust_pathway':
          modifiedPathways = modifiedPathways.map(p => {
            if (p.from === mod.from && p.to === mod.to && p.type === mod.pathwayType) {
              return {
                ...p,
                nutrients: {
                  N: p.nutrients.N * (1 + mod.adjustments.N / 100),
                  P: p.nutrients.P * (1 + mod.adjustments.P / 100),
                  K: p.nutrients.K * (1 + mod.adjustments.K / 100),
                  S: p.nutrients.S * (1 + mod.adjustments.S / 100)
                }
              };
            }
            return p;
          });
          break;
          
        case 'add_pathway':
          modifiedPathways.push(createPathway(
            mod.from,
            mod.to,
            mod.pathwayType,
            mod.nutrients
          ));
          break;
          
        case 'remove_pathway':
          modifiedPathways = modifiedPathways.filter(p => 
            !(p.from === mod.from && p.to === mod.to && p.type === mod.pathwayType)
          );
          break;
      }
    });
    
    return modifiedPathways;
  };

  // Calculate scenario impacts
  const scenarioAnalysis = useMemo(() => {
    const baseline = scenarios.find(s => s.isBaseline);
    const baselinePathways = getScenarioPathways(baseline);
    
    return scenarios.map(scenario => {
      const scenarioPathways = getScenarioPathways(scenario);
      
      // Calculate total nutrients
      const calculateTotals = (pathwayList) => {
        const totals = { N: 0, P: 0, K: 0, S: 0 };
        const inputs = { N: 0, P: 0, K: 0, S: 0 };
        const outputs = { N: 0, P: 0, K: 0, S: 0 };
        const fieldApplications = { N: 0, P: 0, K: 0, S: 0 };
        
        pathwayList.forEach(p => {
          // External inputs
          if (p.from.includes('supplier') || p.from === 'external') {
            Object.keys(inputs).forEach(n => {
              inputs[n] += p.nutrients[n] || 0;
            });
          }
          
          // Outputs
          if (p.type === PATHWAY_TYPES.SALE || p.to.includes('output')) {
            Object.keys(outputs).forEach(n => {
              outputs[n] += p.nutrients[n] || 0;
            });
          }
          
          // Field applications
          const toKOU = kous[p.to];
          if (toKOU && toKOU.type === KOU_TYPES.FIELD) {
            Object.keys(fieldApplications).forEach(n => {
              fieldApplications[n] += p.nutrients[n] || 0;
            });
          }
        });
        
        return { inputs, outputs, fieldApplications };
      };
      
      const baselineTotals = calculateTotals(baselinePathways);
      const scenarioTotals = calculateTotals(scenarioPathways);
      
      // Calculate changes
      const changes = {};
      ['inputs', 'outputs', 'fieldApplications'].forEach(category => {
        changes[category] = {};
        Object.keys(baselineTotals[category]).forEach(nutrient => {
          const baseline = baselineTotals[category][nutrient];
          const scenario = scenarioTotals[category][nutrient];
          changes[category][nutrient] = {
            absolute: scenario - baseline,
            percentage: baseline > 0 ? ((scenario - baseline) / baseline) * 100 : 0
          };
        });
      });
      
      // Calculate field-level compliance
      const fieldCompliance = Object.values(kous)
        .filter(kou => kou.type === KOU_TYPES.FIELD)
        .map(field => {
          const fieldInputs = scenarioPathways
            .filter(p => p.to === field.id)
            .reduce((sum, p) => sum + (p.nutrients.N || 0), 0);
          
          const nPerHa = field.properties.area ? fieldInputs / field.properties.area : 0;
          const isCompliant = nPerHa <= 170; // NVZ limit
          
          return {
            fieldId: field.id,
            fieldName: field.name,
            area: field.properties.area,
            nApplication: fieldInputs,
            nPerHa,
            isCompliant,
            margin: 170 - nPerHa
          };
        });
      
      const overallCompliance = fieldCompliance.every(f => f.isCompliant);
      const fieldsAtRisk = fieldCompliance.filter(f => f.margin < 20 && f.margin > 0).length;
      const fieldsOverLimit = fieldCompliance.filter(f => !f.isCompliant).length;
      
      return {
        scenario,
        totals: scenarioTotals,
        changes,
        fieldCompliance,
        overallCompliance,
        fieldsAtRisk,
        fieldsOverLimit
      };
    });
  }, [scenarios, kous, pathways]);

  // Create new scenario
  const handleCreateScenario = () => {
    if (!newScenarioName) return;
    
    const newScenario = {
      id: `scenario_${Date.now()}`,
      name: newScenarioName,
      description: newScenarioDescription,
      isBaseline: false,
      modifications: []
    };
    
    setScenarios([...scenarios, newScenario]);
    setActiveScenarioId(newScenario.id);
    setShowCreateModal(false);
    setNewScenarioName('');
    setNewScenarioDescription('');
  };

  // Delete scenario
  const handleDeleteScenario = (scenarioId) => {
    if (scenarios.find(s => s.id === scenarioId)?.isBaseline) return;
    
    setScenarios(scenarios.filter(s => s.id !== scenarioId));
    if (activeScenarioId === scenarioId) {
      setActiveScenarioId('baseline');
    }
  };

  // Duplicate scenario
  const handleDuplicateScenario = (scenarioId) => {
    const source = scenarios.find(s => s.id === scenarioId);
    if (!source) return;
    
    const duplicate = {
      ...source,
      id: `scenario_${Date.now()}`,
      name: `${source.name} (Copy)`,
      isBaseline: false
    };
    
    setScenarios([...scenarios, duplicate]);
    setActiveScenarioId(duplicate.id);
  };

  // Add modification to scenario
  const handleAddModification = (type) => {
    if (!activeScenario || activeScenario.isBaseline) return;
    
    const newMod = {
      id: `mod_${Date.now()}`,
      type,
      // Default values based on type
      ...(type === 'adjust_pathway' && {
        from: '',
        to: '',
        pathwayType: PATHWAY_TYPES.FEEDING,
        adjustments: { N: 0, P: 0, K: 0, S: 0 }
      }),
      ...(type === 'add_pathway' && {
        from: '',
        to: '',
        pathwayType: PATHWAY_TYPES.FEEDING,
        nutrients: { N: 0, P: 0, K: 0, S: 0 }
      }),
      ...(type === 'remove_pathway' && {
        from: '',
        to: '',
        pathwayType: PATHWAY_TYPES.FEEDING
      })
    };
    
    const updatedScenarios = scenarios.map(s => 
      s.id === activeScenarioId 
        ? { ...s, modifications: [...s.modifications, newMod] }
        : s
    );
    
    setScenarios(updatedScenarios);
  };

  // Update modification
  const handleUpdateModification = (modId, updates) => {
    const updatedScenarios = scenarios.map(s => 
      s.id === activeScenarioId 
        ? {
            ...s,
            modifications: s.modifications.map(m => 
              m.id === modId ? { ...m, ...updates } : m
            )
          }
        : s
    );
    
    setScenarios(updatedScenarios);
  };

  // Remove modification
  const handleRemoveModification = (modId) => {
    const updatedScenarios = scenarios.map(s => 
      s.id === activeScenarioId 
        ? {
            ...s,
            modifications: s.modifications.filter(m => m.id !== modId)
          }
        : s
    );
    
    setScenarios(updatedScenarios);
  };

  const activeAnalysis = scenarioAnalysis.find(a => a.scenario.id === activeScenarioId);

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Scenario Planning</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Scenario
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {scenarios.map(scenario => (
            <div
              key={scenario.id}
              className={`relative group cursor-pointer p-3 rounded-lg border-2 transition-all ${
                activeScenarioId === scenario.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setActiveScenarioId(scenario.id)}
            >
              <div className="font-medium text-gray-900">{scenario.name}</div>
              <div className="text-xs text-gray-600">{scenario.description}</div>
              {scenario.isBaseline && (
                <div className="text-xs text-blue-600 font-medium mt-1">Baseline</div>
              )}
              
              {!scenario.isBaseline && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateScenario(scenario.id);
                    }}
                    className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScenario(scenario.id);
                    }}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Modifications */}
      {activeScenario && !activeScenario.isBaseline && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Scenario Modifications</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddModification('adjust_pathway')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Adjust Pathway
              </button>
              <button
                onClick={() => handleAddModification('add_pathway')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Add Pathway
              </button>
              <button
                onClick={() => handleAddModification('remove_pathway')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Remove Pathway
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {activeScenario.modifications.map(mod => (
              <div key={mod.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700 capitalize">
                    {mod.type.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => handleRemoveModification(mod.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Modification form based on type */}
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={mod.from}
                    onChange={(e) => handleUpdateModification(mod.id, { from: e.target.value })}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select From...</option>
                    {Object.values(kous).map(kou => (
                      <option key={kou.id} value={kou.id}>{kou.name}</option>
                    ))}
                  </select>

                  <select
                    value={mod.to}
                    onChange={(e) => handleUpdateModification(mod.id, { to: e.target.value })}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select To...</option>
                    {Object.values(kous).map(kou => (
                      <option key={kou.id} value={kou.id}>{kou.name}</option>
                    ))}
                  </select>

                  {mod.type === 'adjust_pathway' && (
                    <div className="col-span-2 grid grid-cols-4 gap-2">
                      {Object.keys(mod.adjustments).map(nutrient => (
                        <div key={nutrient}>
                          <label className="text-xs text-gray-600">{nutrient} %</label>
                          <input
                            type="number"
                            value={mod.adjustments[nutrient]}
                            onChange={(e) => handleUpdateModification(mod.id, {
                              adjustments: {
                                ...mod.adjustments,
                                [nutrient]: parseFloat(e.target.value) || 0
                              }
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            step="5"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {mod.type === 'add_pathway' && (
                    <div className="col-span-2 grid grid-cols-4 gap-2">
                      {Object.keys(mod.nutrients).map(nutrient => (
                        <div key={nutrient}>
                          <label className="text-xs text-gray-600">{nutrient} kg</label>
                          <input
                            type="number"
                            value={mod.nutrients[nutrient]}
                            onChange={(e) => handleUpdateModification(mod.id, {
                              nutrients: {
                                ...mod.nutrients,
                                [nutrient]: parseFloat(e.target.value) || 0
                              }
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {activeScenario.modifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No modifications yet. Add modifications to see their impact.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scenario Analysis */}
      {activeAnalysis && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Scenario Impact Analysis</h4>
          
          {/* Compliance Summary */}
          <div className="mb-6">
            <div className={`p-4 rounded-lg border-2 ${
              activeAnalysis.overallCompliance 
                ? 'bg-green-50 border-green-300' 
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                {activeAnalysis.overallCompliance ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {activeAnalysis.overallCompliance ? 'NVZ Compliant' : 'NVZ Non-Compliant'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {activeAnalysis.fieldsOverLimit > 0 && `${activeAnalysis.fieldsOverLimit} fields over 170 kg N/ha limit`}
                    {activeAnalysis.fieldsAtRisk > 0 && ` • ${activeAnalysis.fieldsAtRisk} fields within 20 kg of limit`}
                    {activeAnalysis.overallCompliance && activeAnalysis.fieldsAtRisk === 0 && 'All fields within safe limits'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrient Changes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">External Inputs</h5>
              <div className="space-y-1">
                {Object.entries(activeAnalysis.changes.inputs).map(([nutrient, change]) => (
                  <div key={nutrient} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{nutrient}:</span>
                    <div className={`font-medium flex items-center gap-1 ${
                      change.percentage > 0 ? 'text-red-600' : 
                      change.percentage < 0 ? 'text-green-600' : 
                      'text-gray-600'
                    }`}>
                      {change.percentage > 0 && <TrendingUp className="w-3 h-3" />}
                      {change.percentage < 0 && <TrendingDown className="w-3 h-3" />}
                      {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%
                      <span className="text-xs text-gray-500 ml-1">
                        ({change.absolute > 0 ? '+' : ''}{change.absolute.toFixed(0)} kg)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 mb-2">Product Outputs</h5>
              <div className="space-y-1">
                {Object.entries(activeAnalysis.changes.outputs).map(([nutrient, change]) => (
                  <div key={nutrient} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{nutrient}:</span>
                    <div className={`font-medium flex items-center gap-1 ${
                      change.percentage > 0 ? 'text-green-600' : 
                      change.percentage < 0 ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {change.percentage > 0 && <TrendingUp className="w-3 h-3" />}
                      {change.percentage < 0 && <TrendingDown className="w-3 h-3" />}
                      {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%
                      <span className="text-xs text-gray-500 ml-1">
                        ({change.absolute > 0 ? '+' : ''}{change.absolute.toFixed(0)} kg)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 mb-2">Field Applications</h5>
              <div className="space-y-1">
                {Object.entries(activeAnalysis.changes.fieldApplications).map(([nutrient, change]) => (
                  <div key={nutrient} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{nutrient}:</span>
                    <div className={`font-medium flex items-center gap-1 ${
                      change.percentage > 0 ? 'text-amber-600' : 
                      change.percentage < 0 ? 'text-blue-600' : 
                      'text-gray-600'
                    }`}>
                      {change.percentage > 0 && <TrendingUp className="w-3 h-3" />}
                      {change.percentage < 0 && <TrendingDown className="w-3 h-3" />}
                      {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%
                      <span className="text-xs text-gray-500 ml-1">
                        ({change.absolute > 0 ? '+' : ''}{change.absolute.toFixed(0)} kg)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Field Compliance Table */}
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Field-by-Field Compliance</h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Area (ha)</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">N Applied (kg)</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">N/ha</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Margin</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeAnalysis.fieldCompliance.map(field => (
                    <tr key={field.fieldId} className={!field.isCompliant ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 text-sm text-gray-900">{field.fieldName}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right">{field.area.toFixed(1)}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right">{field.nApplication.toFixed(0)}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">{field.nPerHa.toFixed(1)}</td>
                      <td className={`px-3 py-2 text-sm text-right font-medium ${
                        field.margin < 0 ? 'text-red-600' : 
                        field.margin < 20 ? 'text-amber-600' : 
                        'text-green-600'
                      }`}>
                        {field.margin > 0 ? '+' : ''}{field.margin.toFixed(1)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {field.isCompliant ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Scenario Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Scenario</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Reduced Fertilizer Use"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newScenarioDescription}
                  onChange={(e) => setNewScenarioDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the scenario objectives..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewScenarioName('');
                  setNewScenarioDescription('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateScenario}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!newScenarioName}
              >
                Create Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioPlanning;
```

## 14. src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 15. src/App.jsx

```jsx
import React from 'react';
import HighResolutionNutrientBudget from './components/HighResolutionNutrientBudget';

function App() {
  return (
    <div className="App">
      <HighResolutionNutrientBudget />
    </div>
  );
}

export default App;
```

## 16. src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light;
  color: #213547;
  background-color: #ffffff;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

## 17. vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

## 18. tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 19. postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 20. index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>High Resolution Nutrient Budget</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## 21. README.md

```markdown
# High-Resolution Nutrient Budgeting for UK Dairy Farms

An advanced nutrient management system for dairy farms based on Key Operational Units (KOUs).

## Features

- **KOU-Based Architecture**: Track nutrients through fields, livestock groups, feed stores, and manure stores
- **Multi-Nutrient Tracking**: Monitor N, P, K, and S through the farm system
- **Nutrient Pathways Visualization**: See how nutrients flow between different farm components
- **Farm Nutrient Map**: Visual representation of field-level nutrient status
- **Scenario Planning**: What-if analysis for different management strategies
- **NVZ Compliance**: Automatic checking against 170 kg N/ha limits
- **Data Management**: Import/export functionality with JSON and CSV support

## Technology Stack

- React 18
- Vite
- Tailwind CSS
- Recharts
- Lucide React Icons

## Getting Started

```bash
npm install
npm run dev
```

## Deployment

Deploy to Vercel:
```bash
npm run build
vercel --prod
```

## Data Structure

The system uses Key Operational Units (KOUs) to represent farm components:
- Fields (with area, use type, soil properties)
- Livestock Groups (with animal counts, milk yield)
- Feed Stores (with capacity, current stock)
- Manure Stores (with capacity, nutrient content)

Nutrients flow between KOUs via pathways (feeding, grazing, manure application, etc.).

## License

MIT
```

## End of Codebase

This completes the full source code for the nutrient-data-advanced project. All components, configuration files, and supporting code are included above.