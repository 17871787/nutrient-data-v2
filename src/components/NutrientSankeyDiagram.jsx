import React, { useMemo } from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';

const NutrientSankeyDiagram = ({ kous, pathways, selectedNutrient = 'N' }) => {
  // Convert KOUs and pathways to Sankey format
  const sankeyData = useMemo(() => {
    // Create nodes from KOUs
    const nodeMap = {};
    const nodes = Object.values(kous).map((kou, index) => {
      nodeMap[kou.id] = index;
      return {
        name: kou.name,
        kouId: kou.id,
        type: kou.type,
        // Calculate total in/out for node sizing
        totalIn: pathways
          .filter(p => p.to === kou.id)
          .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0),
        totalOut: pathways
          .filter(p => p.from === kou.id)
          .reduce((sum, p) => sum + (p.nutrients[selectedNutrient] || 0), 0)
      };
    });

    // Create links from pathways
    const links = pathways
      .filter(pathway => pathway.nutrients[selectedNutrient] > 0)
      .map(pathway => ({
        source: nodeMap[pathway.from],
        target: nodeMap[pathway.to],
        value: pathway.nutrients[selectedNutrient],
        pathwayType: pathway.type,
        nutrientAmount: pathway.nutrients[selectedNutrient]
      }))
      .filter(link => link.source !== undefined && link.target !== undefined);

    return { nodes, links };
  }, [kous, pathways, selectedNutrient]);

  // Custom node component
  const CustomNode = ({ x, y, width, height, index, payload }) => {
    const fillColor = {
      field: '#10b981',
      livestock_group: '#3b82f6',
      feed_store: '#f59e0b',
      manure_store: '#f97316',
      output: '#8b5cf6',
      external: '#6b7280'
    }[payload.type] || '#94a3b8';

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fillColor}
          fillOpacity={0.8}
          stroke={fillColor}
          strokeWidth={2}
          rx={3}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill="white"
          fontWeight="bold"
        >
          {payload.name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="white"
          opacity={0.8}
        >
          {selectedNutrient}: {(payload.totalIn - payload.totalOut).toFixed(0)} kg
        </text>
      </g>
    );
  };

  // Custom link component
  const CustomLink = ({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload }) => {
    const gradientId = `gradient-${index}`;
    
    // Different colors for different pathway types
    const linkColor = {
      feeding: '#3b82f6',
      manure_production: '#f97316',
      manure_application: '#8b4513',
      fertilizer_application: '#10b981',
      harvest: '#84cc16',
      sale: '#8b5cf6',
      grazing: '#22c55e',
      atmospheric_loss: '#ef4444',
      leaching_loss: '#dc2626',
      runoff_loss: '#b91c1c'
    }[payload.pathwayType] || '#94a3b8';

    return (
      <g>
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="0%" stopColor={linkColor} stopOpacity={0.4} />
            <stop offset="100%" stopColor={linkColor} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <path
          d={`
            M${sourceX},${sourceY}
            C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
          `}
          stroke={`url(#${gradientId})`}
          strokeWidth={linkWidth}
          fill="none"
        />
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      if (data.payload.source !== undefined) {
        // Link tooltip
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="font-medium text-gray-900">
              {sankeyData.nodes[data.payload.source].name} → {sankeyData.nodes[data.payload.target].name}
            </p>
            <p className="text-sm text-gray-600 capitalize">
              {data.payload.pathwayType.replace(/_/g, ' ')}
            </p>
            <p className="text-sm font-bold text-blue-600">
              {selectedNutrient}: {data.payload.nutrientAmount.toFixed(0)} kg/year
            </p>
          </div>
        );
      } else {
        // Node tooltip
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="font-medium text-gray-900">{data.payload.name}</p>
            <div className="text-sm space-y-1 mt-1">
              <p className="text-green-600">In: {data.payload.totalIn.toFixed(0)} kg</p>
              <p className="text-red-600">Out: {data.payload.totalOut.toFixed(0)} kg</p>
              <p className="font-bold">
                Net: {(data.payload.totalIn - data.payload.totalOut).toFixed(0)} kg
              </p>
            </div>
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
          Nutrient Flow Diagram - {selectedNutrient}
        </h3>
        <p className="text-sm text-gray-600">
          Interactive visualization of nutrient pathways through the farm system
        </p>
      </div>
      
      <div className="h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sankeyData}
            node={<CustomNode />}
            link={<CustomLink />}
            nodePadding={40}
            nodeWidth={20}
            sort={false}
            iterations={0}
          >
            <Tooltip content={<CustomTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 border-t pt-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Node Types:</div>
        <div className="flex flex-wrap gap-3">
          {[
            { type: 'field', label: 'Fields', color: '#10b981' },
            { type: 'livestock_group', label: 'Livestock', color: '#3b82f6' },
            { type: 'feed_store', label: 'Feed Stores', color: '#f59e0b' },
            { type: 'manure_store', label: 'Manure Stores', color: '#f97316' },
            { type: 'output', label: 'Outputs', color: '#8b5cf6' },
            { type: 'external', label: 'External', color: '#6b7280' }
          ].map(item => (
            <div key={item.type} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
        
        <div className="text-sm font-medium text-gray-700 mb-2 mt-3">Pathway Types:</div>
        <div className="flex flex-wrap gap-3">
          {[
            { type: 'feeding', label: 'Feeding', color: '#3b82f6' },
            { type: 'manure_production', label: 'Manure Production', color: '#f97316' },
            { type: 'fertilizer_application', label: 'Fertilizer', color: '#10b981' },
            { type: 'harvest', label: 'Harvest', color: '#84cc16' },
            { type: 'sale', label: 'Sales', color: '#8b5cf6' },
            { type: 'loss', label: 'Losses', color: '#ef4444' }
          ].map(item => (
            <div key={item.type} className="flex items-center gap-2">
              <div 
                className="w-8 h-2 rounded"
                style={{ backgroundColor: item.color, opacity: 0.6 }}
              />
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutrientSankeyDiagram;