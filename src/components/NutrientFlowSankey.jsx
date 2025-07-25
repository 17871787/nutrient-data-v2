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
    const nodes = Object.values(kous).map(k => ({
      id: k.id,
      name: k.name,
      colour: nodeColours[k.type] ?? '#9ca3af',
    }));
    const idToIdx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));

    const links = pathways
      .filter(p => p.nutrients?.[nutrient] > 0 && p.from !== p.to)
      .map(p => ({
        source: idToIdx[p.from],
        target: idToIdx[p.to],
        value: p.nutrients[nutrient],
      }))
      .filter(l => l.source >= 0 && l.target >= 0);

    return { nodes, links };
  }, [kous, pathways, nutrient]);

  const Node = ({ x, y, width, height, index }) => {
    const node = data.nodes[index];
    return (
      <>
        <Rectangle x={x} y={y} width={width} height={height}
                   fill={node.colour} stroke="#374151" />
        <text x={x + width + 6} y={y + height / 2}
              alignmentBaseline="middle" fontSize={12} fill="#374151">
          {node.name}
        </text>
      </>
    );
  };

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
}

NutrientFlowSankey.propTypes = {
  kous: PropTypes.object.isRequired,
  pathways: PropTypes.array.isRequired,
  nutrient: PropTypes.oneOf(['N', 'P', 'K', 'S']),
};