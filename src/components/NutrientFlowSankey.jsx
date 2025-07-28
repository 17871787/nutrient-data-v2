import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, Sankey, Rectangle, Tooltip, Layer } from 'recharts';
import PropTypes from 'prop-types';
import SankeyLegend from './SankeyLegend';

// colour palette keyed by KOU type
const nodeColours = {
  field: '#22c55e',
  livestock_group: '#71717a',
  feed_store: '#d97706',
  manure_store: '#a16207',
  output: '#3b82f6',
  external: '#6366f1',
};

// Helper to truncate long names
const truncate = (str, max) => (str && str.length > max ? str.slice(0, max - 1) + '…' : str || '');

export default function NutrientFlowSankey({ kous, pathways, nutrient: propNutrient }) {
  const [selectedNutrient, setSelectedNutrient] = useState(propNutrient || 'N');
  const nutrient = propNutrient || selectedNutrient;
  const data = useMemo(() => {
    try {
      // Safety check
      if (!kous || Object.keys(kous).length === 0 || !pathways || pathways.length === 0) {
        return { nodes: [], links: [], maxValue: 1 };
      }

      // Aggregate totals per node for selected nutrient
      const nodeTotals = {};
      pathways.forEach(p => {
        const v = p.nutrients?.[nutrient] ?? 0;
        if (v <= 0) return;
        nodeTotals[p.from] = (nodeTotals[p.from] || 0) + v;
        nodeTotals[p.to] = (nodeTotals[p.to] || 0) + v;
      });

      // Keep only nodes with real flow
      const activeNodes = Object.values(kous)
        .filter(k => nodeTotals[k.id] > 0)
        .map(k => ({ ...k, colour: nodeColours[k.type] ?? '#9ca3af' }));

      // Add special nodes (like atmosphere) that aren't in KOUs but have flow
      const specialNodes = new Set();
      pathways.forEach(p => {
        if ((p.nutrients?.[nutrient] ?? 0) > 0) {
          if (p.from && !kous[p.from] && nodeTotals[p.from] > 0) {
            specialNodes.add(p.from);
          }
          if (p.to && !kous[p.to] && nodeTotals[p.to] > 0) {
            specialNodes.add(p.to);
          }
        }
      });

      specialNodes.forEach(nodeId => {
        const displayName = nodeId.charAt(0).toUpperCase() + nodeId.slice(1);
        activeNodes.push({
          id: nodeId,
          name: displayName,
          type: 'external',
          colour: nodeColours.external
        });
      });

      // Create index mapping
      const idToIdx = Object.fromEntries(activeNodes.map((n, i) => [n.id, i]));

      // Create links only for active nodes
      const links = pathways
        .filter(p => (p.nutrients?.[nutrient] ?? 0) > 0)
        .map(p => ({
          source: idToIdx[p.from],
          target: idToIdx[p.to],
          value: p.nutrients[nutrient],
        }))
        .filter(l => l.source >= 0 && l.target >= 0);

      const maxValue = Math.max(...links.map(l => l.value), 1);

      return { nodes: activeNodes, links, maxValue };
    } catch (error) {
      console.error('Error processing Sankey data:', error);
      return { nodes: [], links: [], maxValue: 1 };
    }
  }, [kous, pathways, nutrient]);

  // Define sankey width for label positioning
  const sankeyWidth = 900;

  // Custom node component with smart label alignment
  const CustomNode = ({ x, y, width, height, index }) => {
    const node = data.nodes[index];
    if (!node) return null;

    // Total flow through this node
    const totalKg = data.links
      .filter(l => l.source === index || l.target === index)
      .reduce((s, l) => s + l.value, 0);

    // Better right-side detection using center point
    const centerX = x + width / 2;
    const onRight = centerX > sankeyWidth * 0.66;

    // Helper to trim only when needed
    const trim = (str, max) => (str.length > max ? str.slice(0, max - 1) + '…' : str);
    const nodeName = node.name || node;
    const name = trim(nodeName, onRight ? 22 : 18);

    // If bar is narrow (<6px) shift label outside for clarity
    const nameX = width < 6 
      ? (onRight ? x - 12 : x + width + 12)
      : (onRight ? x + width - 6 : x + 6);
    const anchor = onRight ? 'end' : 'start';
    const valueX = x + width / 2;

    // Use node's colour property if available
    const nodeColor = node.colour || nodeColours.external;

    return (
      <Layer key={`CustomNode${index}`}>
        {/* node bar */}
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill={nodeColor}
          stroke="#374151"
        />

        {/* node name – positioned to avoid overlap */}
        <text
          x={nameX}
          y={y + height / 2}
          textAnchor={anchor}
          alignmentBaseline="middle"
          fontSize="14"
          fontWeight="600"
          fill="#374151"
          style={{ textShadow: '0 0 3px #fff' }}
        >
          {name}
        </text>

        {/* total kg value – only if > 0 and bar is wide enough */}
        {totalKg >= 1 && width >= 20 && (
          <text
            x={valueX}
            y={y + height / 2}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="11"
            fill="#1e293b"
            style={{ pointerEvents: 'none' }}
          >
            {Math.round(totalKg).toLocaleString()} kg
          </text>
        )}

        <title>{`${nodeName}\nTotal ${nutrient}: ${Math.round(totalKg).toLocaleString()} kg`}</title>
      </Layer>
    );
  };

  // Custom link component without value labels to prevent overlap
  const CustomLink = (props) => {
    const opacity = 0.3 + 0.7 * (props.payload.value / data.maxValue);
    
    return (
      <path
        d={`M${props.sourceX},${props.sourceY} C${props.sourceControlX},${props.sourceY} ${props.targetControlX},${props.targetY} ${props.targetX},${props.targetY}`}
        stroke="#60a5fa"
        strokeWidth={props.linkWidth}
        strokeOpacity={opacity}
        fill="none"
      />
    );
  };

  // Show loading or empty state if no data
  if (!data.nodes.length || !data.links.length) {
    return (
      <div style={{ width: '100%', height: 500 }} className="flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No nutrient flow data available</p>
      </div>
    );
  }

  // Calculate responsive height based on number of nodes
  const diagramHeight = Math.max(400, Math.min(800, data.nodes.length * 40));

  try {
    return (
      <div className="space-y-4">
        {/* Nutrient Selector */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium text-gray-700">Show nutrient:</span>
          <div className="flex gap-2">
            {['N', 'P', 'K', 'S'].map((n) => (
              <button
                key={n}
                onClick={() => setSelectedNutrient(n)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  nutrient === n
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: diagramHeight }}>
          <ResponsiveContainer>
          <Sankey
            data={data}
            nodePadding={30}
            node={<CustomNode />}
            link={<CustomLink />}
            margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
            align="center"
          >
            <Tooltip 
              formatter={v => `${Math.round(v).toLocaleString()} kg ${nutrient}`}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem'
              }}
            />
          </Sankey>
        </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <SankeyLegend />
      </div>
    );
  } catch (error) {
    console.error('Sankey rendering error:', error);
    return (
      <div style={{ width: '100%', height: 500 }} className="flex items-center justify-center bg-red-50 rounded-lg">
        <p className="text-red-600">Error rendering nutrient flow diagram</p>
      </div>
    );
  }
}

NutrientFlowSankey.propTypes = {
  kous: PropTypes.object.isRequired,
  pathways: PropTypes.array.isRequired,
  nutrient: PropTypes.oneOf(['N', 'P', 'K', 'S']),
};