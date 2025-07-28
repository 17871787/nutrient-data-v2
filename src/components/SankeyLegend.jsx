import React from 'react';
import { 
  Package, 
  Wheat, 
  CircleDot, 
  Droplets, 
  TrendingUp,
  Globe
} from 'lucide-react';

const legendItems = [
  { 
    color: '#6366f1', 
    label: 'External Sources', 
    icon: Globe,
    description: 'Feed suppliers, fertiliser'
  },
  { 
    color: '#d97706', 
    label: 'Feed Stores', 
    icon: Package,
    description: 'Silage, concentrates, hay'
  },
  { 
    color: '#22c55e', 
    label: 'Fields', 
    icon: Wheat,
    description: 'Cropped land, grassland'
  },
  { 
    color: '#71717a', 
    label: 'Livestock', 
    icon: CircleDot,
    description: 'Dairy herd, followers'
  },
  { 
    color: '#a16207', 
    label: 'Manure Stores', 
    icon: Droplets,
    description: 'Slurry, FYM storage'
  },
  { 
    color: '#3b82f6', 
    label: 'Outputs', 
    icon: TrendingUp,
    description: 'Milk, meat sales'
  },
];

export default function SankeyLegend() {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Nutrient Flow Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {legendItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-start gap-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-xs">
                <div className="font-medium text-gray-700">{item.label}</div>
                <div className="text-gray-500">{item.description}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Flow width represents nutrient quantity. Hover over nodes and links for details.
        </p>
      </div>
    </div>
  );
}