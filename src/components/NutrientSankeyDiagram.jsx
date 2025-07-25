import React, { useMemo } from 'react';
import { ResponsiveContainer, Sankey, Tooltip, Layer, Rectangle } from 'recharts';

const NutrientSankeyDiagram = ({ kous, pathways, selectedNutrient = 'N' }) => {
  // Convert KOUs and pathways to Sankey format
  const { nodes, links } = useMemo(() => {
    // Create nodes from KOUs
    const nodeMap = new Map();
    Object.values(kous).forEach((kou) => {
      nodeMap.set(kou.id, { name: kou.name, type: kou.type, id: kou.id });
    });
    
    const nodes = Array.from(nodeMap.entries()).map(([id, data]) => ({ 
      name: data.name, 
      type: data.type,
      id: data.id
    }));
    
    const links = pathways
      .filter(p => p.nutrients[selectedNutrient] > 0)
      .map(p => ({
        source: nodes.findIndex(n => n.id === p.from),
        target: nodes.findIndex(n => n.id === p.to),
        value: p.nutrients[selectedNutrient] || 0,
        pathwayType: p.type
      }))
      .filter(l => l.value > 0 && l.source !== -1 && l.target !== -1);

    return { nodes, links };
  }, [kous, pathways, selectedNutrient]);

  const nodeColors = {
    'field': '#10b981',
    'livestock_group': '#3b82f6',
    'feed_store': '#f59e0b',
    'manure_store': '#f97316',
    'output': '#8b5cf6',
    'external': '#6b7280'
  };

  // Custom node component
  const CustomNode = ({ x, y, width, height, index, payload }) => {
    const nodeData = nodes[index];
    if (!nodeData) return null;
    
    return (
      <Layer key={`custom-node-${index}`}>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill={nodeColors[nodeData.type] || '#94a3b8'}
          fillOpacity="1"
        />
        <text
          textAnchor={x > 500 ? 'end' : 'start'}
          x={x > 500 ? x - 6 : x + width + 6}
          y={y + height / 2}
          fontSize="12"
          fill="#333"
          alignmentBaseline="middle"
        >
          {nodeData.name}
        </text>
      </Layer>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      if (data.payload && typeof data.payload.source === 'number' && typeof data.payload.target === 'number') {
        const sourceNode = nodes[data.payload.source];
        const targetNode = nodes[data.payload.target];
        
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {sourceNode?.name} → {targetNode?.name}
            </p>
            <p className="text-sm text-gray-600">
              {selectedNutrient}: {data.value?.toLocaleString()} kg
            </p>
            {data.payload.pathwayType && (
              <p className="text-xs text-gray-500 capitalize">
                {data.payload.pathwayType.replace(/_/g, ' ')}
              </p>
            )}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {selectedNutrient} Nutrient Pathways
        </h3>
        <p className="text-sm text-gray-600">
          Visualizing nutrient flows through the farm system
        </p>
      </div>
      
      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          <Sankey
            data={{ nodes, links }}
            node={CustomNode}
            nodePadding={50}
            nodeWidth={10}
            margin={{ top: 20, right: 150, bottom: 20, left: 150 }}
            link={{ stroke: '#94a3b8', strokeOpacity: 0.5 }}
          >
            <Tooltip content={<CustomTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Inputs</div>
          <div className="text-xl font-bold text-blue-600">
            {pathways
              .filter(p => kous[p.from]?.type === 'external')
              .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0)
              .toLocaleString()} kg
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Outputs</div>
          <div className="text-xl font-bold text-green-600">
            {pathways
              .filter(p => kous[p.to]?.type === 'output')
              .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0)
              .toLocaleString()} kg
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">System Efficiency</div>
          <div className="text-xl font-bold text-purple-600">
            {(() => {
              const inputs = pathways
                .filter(p => kous[p.from]?.type === 'external')
                .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0);
              const productiveOutputs = pathways
                .filter(p => p.to === 'milk_output' || p.to === 'livestock_sales' || p.to === 'crop_sales')
                .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0);
              return inputs > 0 ? ((productiveOutputs / inputs) * 100).toFixed(1) : '0';
            })()}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutrientSankeyDiagram;