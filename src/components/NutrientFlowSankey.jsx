import React, { useMemo } from 'react';
import { ResponsiveContainer, Sankey, Rectangle, Tooltip, Layer } from 'recharts';
import PropTypes from 'prop-types';

// colour palette keyed by KOU type
const nodeColours = {
  field: '#22c55e',
  livestock_group: '#71717a',
  feed_store: '#d97706',
  manure_store: '#a16207',
  output: '#3b82f6',
  external: '#6366f1',
};

export default function NutrientFlowSankey({ kous, pathways, nutrient = 'N' }) {
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
      
      return { nodes, links };
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
        <text
          textAnchor={isOut ? "start" : "end"}
          x={isOut ? x + width + 6 : x - 6}
          y={y + height / 2}
          fontSize="12"
          fill="#374151"
          alignmentBaseline="middle"
        >
          {payload.name || data.nodes[index]}
        </text>
      </Layer>
    );
  };

  // Custom link component with value labels
  const CustomLink = (props) => {
    const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index } = props;
    
    // Calculate midpoint for label placement
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    
    return (
      <Layer key={`CustomLink${index}`}>
        <path
          d={`
            M${sourceX},${sourceY}
            C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
          `}
          stroke="#60a5fa"
          strokeWidth={linkWidth}
          fill="none"
          strokeOpacity={0.4}
        />
        {linkWidth > 5 && ( // Only show label for significant flows
          <text
            x={midX}
            y={midY - 5}
            fontSize="10"
            fill="#1f2937"
            textAnchor="middle"
            className="pointer-events-none"
          >
            {Math.round(props.payload.value).toLocaleString()} kg
          </text>
        )}
      </Layer>
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

  try {
    return (
      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          <Sankey
            data={data}
            nodePadding={50}
            node={<CustomNode />}
            link={<CustomLink />}
            margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
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