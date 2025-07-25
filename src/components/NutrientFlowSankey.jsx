import React, { useMemo } from 'react';
import { ResponsiveContainer, Sankey, Rectangle, Tooltip } from 'recharts';
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

      console.log('Sankey data processed:', { 
        nodes: nodes.slice(0, 5),
        nodeCount: nodes.length, 
        linkCount: links.length,
        sampleLinks: links.slice(0, 3) 
      });
      
      return { nodes, links };
    } catch (error) {
      console.error('Error processing Sankey data:', error);
      return { nodes: [], links: [] };
    }
  }, [kous, pathways, nutrient]);

  // Remove custom node renderer for now to isolate the issue

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
            link={{ stroke: '#60a5fa', strokeOpacity: 0.45 }}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <Tooltip formatter={v => `${Math.round(v).toLocaleString()} kg`} />
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