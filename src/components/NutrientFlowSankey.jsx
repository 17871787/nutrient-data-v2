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
        return { nodes: [], links: [] };
      }

      // Group KOUs by type to create hierarchical structure
      const kousByType = {};
      Object.values(kous).forEach(kou => {
        if (!kousByType[kou.type]) kousByType[kou.type] = [];
        kousByType[kou.type].push(kou);
      });

      // Create ordered nodes list - external inputs first, outputs last
      const nodeOrder = ['external', 'feed_store', 'field', 'livestock_group', 'manure_store', 'output'];
      const nodes = [];
      const idToIdx = {};
      
      // First add all KOUs in hierarchical order
      nodeOrder.forEach(type => {
        if (kousByType[type]) {
          kousByType[type].forEach(kou => {
            idToIdx[kou.id] = nodes.length;
            nodes.push(kou.name);
          });
        }
      });

      // Then add any special nodes that appear in pathways but aren't KOUs
      const specialNodes = new Set();
      pathways.forEach(p => {
        if (p.from && !idToIdx.hasOwnProperty(p.from)) {
          specialNodes.add(p.from);
        }
        if (p.to && !idToIdx.hasOwnProperty(p.to)) {
          specialNodes.add(p.to);
        }
      });

      // Add special nodes at the end
      specialNodes.forEach(nodeId => {
        idToIdx[nodeId] = nodes.length;
        // Capitalize first letter for display
        const displayName = nodeId.charAt(0).toUpperCase() + nodeId.slice(1);
        nodes.push(displayName);
      });

      // Create links with cycle detection
      const links = [];
      const linkMap = new Map(); // Track links to aggregate duplicates
      
      pathways.forEach(p => {
        if (p.nutrients?.[nutrient] > 0 && p.from && p.to && p.from !== p.to) {
          const sourceIdx = idToIdx[p.from];
          const targetIdx = idToIdx[p.to];
          
          if (sourceIdx !== undefined && targetIdx !== undefined && 
              sourceIdx !== targetIdx) {
            
            const linkKey = `${sourceIdx}-${targetIdx}`;
            
            if (linkMap.has(linkKey)) {
              // Aggregate values for duplicate links
              linkMap.get(linkKey).value += p.nutrients[nutrient];
            } else {
              linkMap.set(linkKey, {
                source: sourceIdx,
                target: targetIdx,
                value: p.nutrients[nutrient]
              });
            }
          }
        }
      });

      // Convert map to array
      links.push(...linkMap.values());
      
      // Calculate max flow value for dynamic opacity
      const maxDy = Math.max(...links.map(l => l.value), 1);
      
      return { nodes, links, maxDy };
    } catch (error) {
      console.error('Error processing Sankey data:', error);
      return { nodes: [], links: [] };
    }
  }, [kous, pathways, nutrient]);

  // Custom node component with labels
  const CustomNode = ({ x, y, width, height, index, payload }) => {
    const isOut = x > width / 2;
    
    // Try to determine node type from name or position
    const nodeName = payload.name || data.nodes[index];
    let nodeColor = '#3b82f6'; // default blue
    
    if (nodeName.toLowerCase().includes('field')) nodeColor = nodeColours.field;
    else if (nodeName.toLowerCase().includes('herd') || nodeName.toLowerCase().includes('livestock')) nodeColor = nodeColours.livestock_group;
    else if (nodeName.toLowerCase().includes('feed') || nodeName.toLowerCase().includes('silage') || nodeName.toLowerCase().includes('conc')) nodeColor = nodeColours.feed_store;
    else if (nodeName.toLowerCase().includes('slurry') || nodeName.toLowerCase().includes('manure') || nodeName.toLowerCase().includes('fym')) nodeColor = nodeColours.manure_store;
    else if (nodeName.toLowerCase().includes('milk') || nodeName.toLowerCase().includes('sales')) nodeColor = nodeColours.output;
    else if (nodeName.toLowerCase().includes('supplier') || nodeName.toLowerCase().includes('external')) nodeColor = nodeColours.external;
    
    // Calculate total nutrient flow through this node
    const totalKg = data.links
      .filter(l => l.source === index || l.target === index)
      .reduce((s, l) => s + l.value, 0);
    
    return (
      <Layer key={`CustomNode${index}`}>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill={nodeColor}
          fillOpacity="0.8"
        />
        {/* Node name centered above */}
        <text
          x={x + width / 2}
          y={y - 6}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#374151"
          style={{ textShadow: '0 0 3px #fff' }}
        >
          {truncate(nodeName, 20)}
        </text>
        {/* Total kg inside the bar */}
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="11"
          fill="#1e293b"
          style={{ pointerEvents: 'none' }}
        >
          {totalKg.toLocaleString()} kg
        </text>
        <title>{`${nodeName}\nTotal ${nutrient}: ${Math.round(totalKg).toLocaleString()} kg`}</title>
      </Layer>
    );
  };

  // Custom link component without value labels to prevent overlap
  const CustomLink = (props) => {
    const opacity = 0.3 + 0.7 * (props.payload.value / data.maxDy);
    
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