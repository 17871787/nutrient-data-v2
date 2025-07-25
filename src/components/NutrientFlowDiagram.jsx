import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight, Package, Beaker, MapPin, Milk, Factory, TrendingDown } from 'lucide-react';

const NutrientFlowDiagram = ({ kous, pathways, selectedNutrient = 'N' }) => {
  // Group pathways by type and calculate totals
  const flowAnalysis = useMemo(() => {
    // Group KOUs by type
    const kousByType = Object.values(kous).reduce((acc, kou) => {
      if (!acc[kou.type]) acc[kou.type] = [];
      acc[kou.type].push(kou);
      return acc;
    }, {});

    // Calculate flows between KOU types
    const flows = {};
    pathways.forEach(pathway => {
      const fromKOU = kous[pathway.from];
      const toKOU = kous[pathway.to];
      if (!fromKOU || !toKOU) return;

      const flowKey = `${fromKOU.type}_to_${toKOU.type}`;
      if (!flows[flowKey]) {
        flows[flowKey] = {
          from: fromKOU.type,
          to: toKOU.type,
          pathways: [],
          total: 0
        };
      }
      
      flows[flowKey].pathways.push(pathway);
      flows[flowKey].total += pathway.nutrients[selectedNutrient] || 0;
    });

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
        inputs,
        outputs,
        net: inputs - outputs,
        count: kouList.length
      };
    });

    return { flows: Object.values(flows), balances, kousByType };
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

  const formatKOUTypeName = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Prepare data for balance chart
  const balanceChartData = Object.entries(flowAnalysis.balances).map(([type, data]) => ({
    name: formatKOUTypeName(type),
    inputs: data.inputs,
    outputs: -data.outputs, // negative for visualization
    net: data.net,
    type
  }));

  return (
    <div className="space-y-6">
      {/* Flow Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {selectedNutrient} Nutrient Flows Between System Components
        </h3>
        
        {/* Major Flows */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-700">Major Nutrient Pathways</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flowAnalysis.flows
              .filter(flow => flow.total > 0)
              .sort((a, b) => b.total - a.total)
              .slice(0, 9)
              .map((flow, index) => {
                const FromIcon = getKOUTypeIcon(flow.from);
                const ToIcon = getKOUTypeIcon(flow.to);
                const percentage = (flow.total / flowAnalysis.flows.reduce((sum, f) => sum + f.total, 0)) * 100;
                
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {typeof FromIcon === 'string' ? (
                          <span className="text-lg">{FromIcon}</span>
                        ) : (
                          <FromIcon className="w-4 h-4" style={{ color: getKOUTypeColor(flow.from) }} />
                        )}
                        <span className="text-sm font-medium">{formatKOUTypeName(flow.from)}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-2">
                        {typeof ToIcon === 'string' ? (
                          <span className="text-lg">{ToIcon}</span>
                        ) : (
                          <ToIcon className="w-4 h-4" style={{ color: getKOUTypeColor(flow.to) }} />
                        )}
                        <span className="text-sm font-medium">{formatKOUTypeName(flow.to)}</span>
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

        {/* Balance Chart */}
        <div>
          <h4 className="font-medium text-gray-700 mb-4">Component Balances</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={balanceChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${Math.abs(value).toLocaleString()} kg`} />
              <Tooltip 
                formatter={(value) => `${Math.abs(value).toLocaleString()} kg`}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="inputs" fill="#10b981" name="Inputs" />
              <Bar dataKey="outputs" fill="#ef4444" name="Outputs" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* System Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total System Input</div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(flowAnalysis.balances)
                .reduce((sum, b) => sum + b.inputs, 0)
                .toLocaleString()} kg {selectedNutrient}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total System Output</div>
            <div className="text-2xl font-bold text-red-600">
              {Object.values(flowAnalysis.balances)
                .reduce((sum, b) => sum + b.outputs, 0)
                .toLocaleString()} kg {selectedNutrient}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">System Efficiency</div>
            <div className="text-2xl font-bold text-gray-900">
              {(() => {
                const totalIn = Object.values(flowAnalysis.balances).reduce((sum, b) => sum + b.inputs, 0);
                const totalOut = pathways
                  .filter(p => p.to === 'milk_output' || p.to === 'livestock_sales' || p.to === 'crop_sales')
                  .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0);
                return totalIn > 0 ? ((totalOut / totalIn) * 100).toFixed(1) : '0';
              })()}%
            </div>
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
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pathways</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flowAnalysis.flows
                  .filter(flow => flow.total > 0)
                  .sort((a, b) => b.total - a.total)
                  .map((flow, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{formatKOUTypeName(flow.from)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{formatKOUTypeName(flow.to)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                        {flow.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 text-right">{flow.pathways.length}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutrientFlowDiagram;