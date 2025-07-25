import React from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';

export default function SimpleSankey() {
  // Minimal test data
  const data = {
    nodes: [
      { name: 'External' },
      { name: 'Fields' },
      { name: 'Livestock' },
      { name: 'Output' }
    ],
    links: [
      { source: 0, target: 1, value: 100 },
      { source: 1, target: 2, value: 80 },
      { source: 2, target: 3, value: 60 }
    ]
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <Sankey 
          data={data}
          nodePadding={50}
          link={{ stroke: '#8884d8' }}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}