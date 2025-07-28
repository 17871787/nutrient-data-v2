import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ArrowRight, Package, Beaker, MapPin, Milk, Factory, TrendingDown, AlertCircle } from 'lucide-react';

const NutrientPathwaysView = ({ kous, pathways }) => {
  const [selectedNutrient, setSelectedNutrient] = useState('N');
  // Helper function to format KOU type names
  const formatKOUTypeName = (type) => {
    if (!type) return '';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Group pathways by type and calculate totals
  const flowAnalysis = useMemo(() => {
    try {
      // Check if we have data
      if (!kous || Object.keys(kous).length === 0 || !pathways || pathways.length === 0) {
        return { flows: [], balances: {}, kousByType: {} };
      }
      
      // Group KOUs by type
      const kousByType = Object.values(kous).reduce((acc, kou) => {
        if (!acc[kou.type]) acc[kou.type] = [];
        acc[kou.type].push(kou);
        return acc;
      }, {});

      // Calculate flows between KOU types
      const flowMap = new Map();
      let processedCount = 0;
      let skippedCount = 0;
      
      pathways.forEach(pathway => {
        const fromKOU = kous[pathway.from];
        const toKOU = kous[pathway.to];
        if (!fromKOU || !toKOU) {
          skippedCount++;
          return;
        }

        const flowKey = `${fromKOU.type}_to_${toKOU.type}`;
        if (!flowMap.has(flowKey)) {
          flowMap.set(flowKey, {
            from: fromKOU.type,
            to: toKOU.type,
            fromName: formatKOUTypeName(fromKOU.type),
            toName: formatKOUTypeName(toKOU.type),
            pathways: [],
            total: 0
          });
        }
        
        const flow = flowMap.get(flowKey);
        flow.pathways.push(pathway);
        flow.total += pathway.nutrients[selectedNutrient] || 0;
        processedCount++;
      });

      // Convert to array and sort by total
      const flows = Array.from(flowMap.values())
        .filter(flow => flow.total > 0)
        .sort((a, b) => b.total - a.total);

      // Calculate balances by KOU type
      const balances = {};
      Object.entries(kousByType).forEach(([type, kouList]) => {
        const inputs = pathways
          .filter(p => kouList.some(kou => kou.id === p.to))
          .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0);
        
        const outputs = pathways
          .filter(p => kouList.some(kou => kou.id === p.from))
          .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0);
        
        balances[type] = {
          name: formatKOUTypeName(type),
          inputs,
          outputs,
          net: inputs - outputs,
          count: kouList.length
        };
      });

      return { flows, balances, kousByType, processedCount, skippedCount };
    } catch (error) {
      console.error('Error in flow analysis:', error);
      return { flows: [], balances: {}, kousByType: {}, error: error.message, processedCount: 0, skippedCount: 0 };
    }
  }, [kous, pathways, selectedNutrient]);

  const getKOUTypeIcon = (type) => {
    const icons = {
      'field': MapPin,
      'livestock_group': '🐄',
      'feed_store': Package,
      'manure_store': Beaker,
      'output': Milk,
      'external': Factory
    };
    return icons[type] || Package;
  };

  const getKOUTypeColor = (type) => {
    const colors = {
      'field': '#10b981',
      'livestock_group': '#3b82f6',
      'feed_store': '#f59e0b',
      'manure_store': '#f97316',
      'output': '#8b5cf6',
      'external': '#6b7280'
    };
    return colors[type] || '#94a3b8';
  };

  // Prepare data for balance chart
  const balanceChartData = Object.entries(flowAnalysis.balances)
    .map(([type, data]) => ({
      name: data.name,
      inputs: data.inputs,
      outputs: -data.outputs, // negative for visualization
      net: data.net,
      type
    }))
    .filter(item => item.inputs > 0 || Math.abs(item.outputs) > 0);

  // Prepare data for pie chart showing distribution of flows
  const pieData = flowAnalysis.flows
    .slice(0, 6)
    .map(flow => ({
      name: `${flow.fromName} → ${flow.toName}`,
      value: flow.total,
      color: getKOUTypeColor(flow.from)
    }));

  // Calculate system-wide metrics
  const systemMetrics = useMemo(() => {
    const totalInputs = pathways
      .filter(p => kous[p.from]?.type === 'external')
      .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0);
    
    const productiveOutputs = pathways
      .filter(p => p.to === 'milk_output' || p.to === 'livestock_sales' || p.to === 'crop_sales')
      .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0);
    
    const losses = pathways
      .filter(p => p.type === 'atmospheric_loss' || p.type === 'leaching_loss' || p.type === 'runoff_loss')
      .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0);
    
    const efficiency = totalInputs > 0 ? (productiveOutputs / totalInputs) * 100 : 0;
    
    return { totalInputs, productiveOutputs, losses, efficiency };
  }, [pathways, kous, selectedNutrient]);

  if (flowAnalysis.flows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 text-amber-600 mb-4">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-bold">No Flow Data Available</h3>
        </div>
        <p className="text-gray-600 mb-4">No nutrient pathways found for {selectedNutrient}.</p>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Debug Information:</h4>
          <p className="text-sm text-gray-600">Total KOUs: {Object.keys(kous).length}</p>
          <p className="text-sm text-gray-600">Total Pathways: {pathways.length}</p>
          <p className="text-sm text-gray-600">Selected Nutrient: {selectedNutrient}</p>
          <p className="text-sm text-gray-600">Processed Pathways: {flowAnalysis.processedCount || 0}</p>
          <p className="text-sm text-gray-600">Skipped Pathways: {flowAnalysis.skippedCount || 0}</p>
          {flowAnalysis.error && (
            <p className="text-sm text-red-600">Error: {flowAnalysis.error}</p>
          )}
          {pathways.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Sample pathway:</p>
              <p className="text-xs text-gray-600">From: {pathways[0].from} → To: {pathways[0].to}</p>
              <p className="text-xs text-gray-600">Nutrients: {JSON.stringify(pathways[0].nutrients)}</p>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Missing KOUs:</p>
                {pathways.slice(0, 5).map((p, i) => {
                  const fromMissing = !kous[p.from];
                  const toMissing = !kous[p.to];
                  if (fromMissing || toMissing) {
                    return (
                      <p key={i} className="text-xs text-red-600">
                        {fromMissing && `Missing from: ${p.from}`}
                        {fromMissing && toMissing && ', '}
                        {toMissing && `Missing to: ${p.to}`}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nutrient Selector */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-700">Select Nutrient to Visualize</h3>
          <div className="flex gap-2">
            {['N', 'P', 'K', 'S'].map((nutrient) => (
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

      {/* Flow Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {selectedNutrient} Nutrient Flows Between System Components
        </h3>
        
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Inputs</div>
            <div className="text-2xl font-bold text-blue-600">
              {systemMetrics.totalInputs.toLocaleString()} kg
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Productive Outputs</div>
            <div className="text-2xl font-bold text-green-600">
              {systemMetrics.productiveOutputs.toLocaleString()} kg
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Losses</div>
            <div className="text-2xl font-bold text-red-600">
              {systemMetrics.losses.toLocaleString()} kg
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">System Efficiency</div>
            <div className="text-2xl font-bold text-purple-600">
              {systemMetrics.efficiency.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Major Flows Grid */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Major Nutrient Pathways</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flowAnalysis.flows.slice(0, 9).map((flow, index) => {
              const FromIcon = getKOUTypeIcon(flow.from);
              const ToIcon = getKOUTypeIcon(flow.to);
              const percentage = (flow.total / flowAnalysis.flows.reduce((sum, f) => sum + f.total, 0)) * 100;
              
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {typeof FromIcon === 'string' ? (
                        <span className="text-lg">{FromIcon}</span>
                      ) : (
                        <FromIcon className="w-4 h-4" style={{ color: getKOUTypeColor(flow.from) }} />
                      )}
                      <span className="text-sm font-medium">{flow.fromName}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex items-center gap-2">
                      {typeof ToIcon === 'string' ? (
                        <span className="text-lg">{ToIcon}</span>
                      ) : (
                        <ToIcon className="w-4 h-4" style={{ color: getKOUTypeColor(flow.to) }} />
                      )}
                      <span className="text-sm font-medium">{flow.toName}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {flow.total.toLocaleString()} kg
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% of total flow
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    {flow.pathways.length} pathway{flow.pathways.length > 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Chart */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Component Balances</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={balanceChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tickFormatter={(value) => `${Math.abs(value).toLocaleString()}`} />
                <Tooltip 
                  formatter={(value) => `${Math.abs(value).toLocaleString()} kg`}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="inputs" fill="#10b981" name="Inputs" />
                <Bar dataKey="outputs" fill="#ef4444" name="Outputs" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Flow Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()} kg`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Flows Table */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-3">Detailed Flow Analysis</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{selectedNutrient} (kg)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pathways</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flowAnalysis.flows.map((flow, index) => {
                  const percentage = (flow.total / flowAnalysis.flows.reduce((sum, f) => sum + f.total, 0)) * 100;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{flow.fromName}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{flow.toName}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                        {flow.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 text-right">
                        {percentage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 text-right">{flow.pathways.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutrientPathwaysView;