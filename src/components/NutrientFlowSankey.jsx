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

      const nodes = Object.values(kous).map(k => ({
        id: k.id,
        name: k.name,
        colour: nodeColours[k.type] ?? '#9ca3af',
      }));
      const idToIdx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));

      // Create links, but prevent circular references
      const linkSet = new Set();
      const links = [];
      
      pathways
        .filter(p => p.nutrients?.[nutrient] > 0 && p.from !== p.to)
        .forEach(p => {
          const sourceIdx = idToIdx[p.from];
          const targetIdx = idToIdx[p.to];
          
          if (sourceIdx !== undefined && targetIdx !== undefined && 
              sourceIdx >= 0 && targetIdx >= 0 && sourceIdx !== targetIdx) {
            // Create a unique key for this link
            const linkKey = `${sourceIdx}-${targetIdx}`;
            
            // Only add if we haven't seen this exact link before
            if (!linkSet.has(linkKey)) {
              linkSet.add(linkKey);
              links.push({
                source: sourceIdx,
                target: targetIdx,
                value: p.nutrients[nutrient],
              });
            }
          }
        });

      console.log('Sankey data processed:', { 
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

  const Node = ({ x, y, width, height, index }) => {
    const node = data.nodes[index];
    if (!node) return null;
    
    return (
      <>
        <Rectangle x={x} y={y} width={width} height={height}
                   fill={node.colour || '#9ca3af'} stroke="#374151" />
        <text x={x + width + 6} y={y + height / 2}
              alignmentBaseline="middle" fontSize={12} fill="#374151">
          {node.name || ''}
        </text>
      </>
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
            node={Node}
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