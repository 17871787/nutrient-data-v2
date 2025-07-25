import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, ChevronRight, AlertTriangle, CheckCircle, Info, Printer, Save, TrendingDown, Shield } from 'lucide-react';

// Pilot farms data with basic info
const PILOT_FARMS = [
  { id: 'FARM-001', name: 'Greenfield Farm', hectares: 250, cows: 180 },
  { id: 'FARM-002', name: 'Meadowbrook Farm', hectares: 320, cows: 220 },
  { id: 'FARM-003', name: 'Hillside Farm', hectares: 180, cows: 150 },
  { id: 'FARM-004', name: 'Valley Farm', hectares: 450, cows: 350 },
  { id: 'FARM-005', name: 'Riverside Farm', hectares: 280, cows: 200 },
  { id: 'FARM-006', name: 'Oak Tree Farm', hectares: 200, cows: 160 },
  { id: 'FARM-007', name: 'Sunny Acres', hectares: 380, cows: 280 },
  { id: 'FARM-008', name: 'Highland Farm', hectares: 160, cows: 120 },
  { id: 'FARM-009', name: 'Clover Farm', hectares: 300, cows: 240 },
  { id: 'FARM-010', name: 'Spring Farm', hectares: 220, cows: 180 }
];

// NVZ limits and compliance thresholds
const NVZ_LIMITS = {
  nMax: 170, // kg N/ha/year from organic manure
  nFieldLimit: 250, // kg N/ha/year total
  pMax: 50, // kg P/ha/year (simplified)
  storageMonths: 5, // Required storage capacity
};

const NutrientBudgetingMVP = () => {
  const [selectedFarmId, setSelectedFarmId] = useState('FARM-001');
  const [currentStep, setCurrentStep] = useState(1);
  const [showReport, setShowReport] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Farm data state
  const [farmData, setFarmData] = useState({});

  // Initialize/load data
  useEffect(() => {
    const saved = localStorage.getItem('nutrientBudgetData');
    if (saved) {
      setFarmData(JSON.parse(saved));
      setLastSaved(new Date());
    } else {
      // Initialize with empty data structure
      const initialData = {};
      PILOT_FARMS.forEach(farm => {
        initialData[farm.id] = {
          ...farm,
          inputs: {
            // Livestock
            dairyCows: farm.cows,
            youngstock: Math.round(farm.cows * 0.7),
            
            // Land use (ha)
            grassland: Math.round(farm.hectares * 0.7),
            arable: Math.round(farm.hectares * 0.3),
            
            // Crop yields (t/ha)
            grassYield: 10,
            silageYield: 35,
            wheatYield: 8,
            
            // Purchased feeds (tonnes/year)
            concentrates: Math.round(farm.cows * 2.5),
            protein: Math.round(farm.cows * 0.5),
            
            // Fertilizer purchases (tonnes/year)
            ammoniumNitrate: 15,
            urea: 10,
            TSP: 8,
            
            // Manure management
            slurryProduced: Math.round(farm.cows * 35), // m³/year
            FYMProduced: Math.round(farm.cows * 12), // tonnes/year
            storageCapacity: 4, // months
            
            // Exports
            milkSold: Math.round(farm.cows * 8500), // litres/year
            culls: Math.round(farm.cows * 0.25),
            calvesBeef: Math.round(farm.cows * 0.4),
          }
        };
      });
      setFarmData(initialData);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (Object.keys(farmData).length > 0) {
      localStorage.setItem('nutrientBudgetData', JSON.stringify(farmData));
      setLastSaved(new Date());
    }
  }, [farmData]);

  const currentFarm = farmData[selectedFarmId];
  const inputs = currentFarm?.inputs || {};

  // Update input value
  const updateInput = (field, value) => {
    setFarmData(prev => ({
      ...prev,
      [selectedFarmId]: {
        ...prev[selectedFarmId],
        inputs: {
          ...prev[selectedFarmId].inputs,
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  // Calculate nutrient balance
  const calculateBalance = () => {
    if (!inputs.dairyCows) return null;
    
    // INPUTS (kg/year)
    const nInputs = {
      // From purchased feed (assuming 2.8% N in concentrates, 6.5% N in protein)
      concentrates: inputs.concentrates * 1000 * 0.028,
      protein: inputs.protein * 1000 * 0.065,
      
      // From fertilizers
      ammoniumNitrate: inputs.ammoniumNitrate * 1000 * 0.35, // 35% N
      urea: inputs.urea * 1000 * 0.46, // 46% N
      
      // Biological N fixation from clover (estimated)
      fixation: inputs.grassland * 50, // 50 kg N/ha from clover
      
      // Atmospheric deposition
      deposition: currentFarm.hectares * 30, // 30 kg N/ha/year
    };
    
    const pInputs = {
      // From purchased feed (assuming 0.4% P in concentrates, 0.7% P in protein)
      concentrates: inputs.concentrates * 1000 * 0.004,
      protein: inputs.protein * 1000 * 0.007,
      
      // From fertilizers
      TSP: inputs.TSP * 1000 * 0.20, // 20% P
    };
    
    // OUTPUTS (kg/year)
    const nOutputs = {
      // In milk (0.5% N)
      milk: inputs.milkSold * 1.03 * 0.005, // 1.03 kg/L density
      
      // In livestock
      culls: inputs.culls * 650 * 0.025, // 650kg liveweight, 2.5% N
      calves: inputs.calvesBeef * 250 * 0.025, // 250kg liveweight
      
      // Crop offtake
      silage: inputs.grassland * inputs.silageYield * 1000 * 0.004, // 0.4% N in silage
      wheat: inputs.arable * 0.5 * inputs.wheatYield * 1000 * 0.018, // 1.8% N in wheat
      
      // Losses (simplified estimates)
      ammonia: inputs.dairyCows * 35, // kg NH3-N/cow/year
      leaching: currentFarm.hectares * 25, // kg N/ha/year average
    };
    
    const pOutputs = {
      // In milk (0.09% P)
      milk: inputs.milkSold * 1.03 * 0.0009,
      
      // In livestock
      culls: inputs.culls * 650 * 0.007, // 0.7% P
      calves: inputs.calvesBeef * 250 * 0.007,
      
      // Crop offtake
      silage: inputs.grassland * inputs.silageYield * 1000 * 0.0007,
      wheat: inputs.arable * 0.5 * inputs.wheatYield * 1000 * 0.004,
    };
    
    // Calculate totals
    const totalNInputs = Object.values(nInputs).reduce((a, b) => a + b, 0);
    const totalNOutputs = Object.values(nOutputs).reduce((a, b) => a + b, 0);
    const totalPInputs = Object.values(pInputs).reduce((a, b) => a + b, 0);
    const totalPOutputs = Object.values(pOutputs).reduce((a, b) => a + b, 0);
    
    // Balance and efficiency
    const nBalance = totalNInputs - totalNOutputs;
    const pBalance = totalPInputs - totalPOutputs;
    const nEfficiency = (totalNOutputs / totalNInputs) * 100;
    const pEfficiency = (totalPOutputs / totalPInputs) * 100;
    
    // Per hectare calculations
    const nBalancePerHa = nBalance / currentFarm.hectares;
    const pBalancePerHa = pBalance / currentFarm.hectares;
    const organicNPerHa = (inputs.slurryProduced * 3 + inputs.FYMProduced * 5) / currentFarm.hectares; // Simplified
    
    return {
      nInputs,
      nOutputs,
      pInputs,
      pOutputs,
      totalNInputs,
      totalNOutputs,
      totalPInputs,
      totalPOutputs,
      nBalance,
      pBalance,
      nEfficiency,
      pEfficiency,
      nBalancePerHa,
      pBalancePerHa,
      organicNPerHa,
      
      // Compliance checks
      nvzCompliant: organicNPerHa <= NVZ_LIMITS.nMax && inputs.storageCapacity >= NVZ_LIMITS.storageMonths,
      storageCompliant: inputs.storageCapacity >= NVZ_LIMITS.storageMonths,
      organicNCompliant: organicNPerHa <= NVZ_LIMITS.nMax,
    };
  };

  const balance = calculateBalance();

  // Simple input component
  const InputField = ({ label, value, onChange, unit, info, min = 0, step = 1 }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {info && (
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {info}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          step={step}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {unit && <span className="text-sm text-gray-600 whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );

  // Step 1: Farm Selection
  const FarmSelection = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Select Farm</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PILOT_FARMS.map(farm => (
          <button
            key={farm.id}
            onClick={() => {
              setSelectedFarmId(farm.id);
              setCurrentStep(2);
            }}
            className={`p-4 text-left rounded-lg border-2 transition-all hover:border-blue-500 ${
              selectedFarmId === farm.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="font-medium text-gray-900">{farm.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              {farm.hectares} ha • {farm.cows} cows
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: Input Data
  const InputData = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Enter Farm Data - {currentFarm?.name}</h2>
        <button
          onClick={() => setCurrentStep(1)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Change Farm
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Livestock */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Livestock Numbers</h3>
          <InputField
            label="Dairy Cows"
            value={inputs.dairyCows}
            onChange={(v) => updateInput('dairyCows', v)}
            unit="head"
          />
          <InputField
            label="Youngstock"
            value={inputs.youngstock}
            onChange={(v) => updateInput('youngstock', v)}
            unit="head"
          />
        </div>

        {/* Land Use */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Land Use</h3>
          <InputField
            label="Grassland"
            value={inputs.grassland}
            onChange={(v) => updateInput('grassland', v)}
            unit="ha"
            info="Include temporary and permanent grass"
          />
          <InputField
            label="Arable"
            value={inputs.arable}
            onChange={(v) => updateInput('arable', v)}
            unit="ha"
            info="Cereals and other crops"
          />
        </div>

        {/* Crop Yields */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Crop Yields</h3>
          <InputField
            label="Grass/Silage"
            value={inputs.silageYield}
            onChange={(v) => updateInput('silageYield', v)}
            unit="t/ha"
            step={0.5}
          />
          <InputField
            label="Wheat"
            value={inputs.wheatYield}
            onChange={(v) => updateInput('wheatYield', v)}
            unit="t/ha"
            step={0.1}
          />
        </div>

        {/* Purchased Feeds */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Purchased Feeds</h3>
          <InputField
            label="Concentrates"
            value={inputs.concentrates}
            onChange={(v) => updateInput('concentrates', v)}
            unit="t/year"
            info="Total compound feeds"
          />
          <InputField
            label="Protein Feeds"
            value={inputs.protein}
            onChange={(v) => updateInput('protein', v)}
            unit="t/year"
            info="Soya, rapemeal, etc."
          />
        </div>

        {/* Fertilizers */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Fertilizer Purchases</h3>
          <InputField
            label="Ammonium Nitrate"
            value={inputs.ammoniumNitrate}
            onChange={(v) => updateInput('ammoniumNitrate', v)}
            unit="t/year"
          />
          <InputField
            label="Urea"
            value={inputs.urea}
            onChange={(v) => updateInput('urea', v)}
            unit="t/year"
          />
          <InputField
            label="TSP"
            value={inputs.TSP}
            onChange={(v) => updateInput('TSP', v)}
            unit="t/year"
            info="Triple Super Phosphate"
          />
        </div>

        {/* Manure Management */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Manure Management</h3>
          <InputField
            label="Slurry Produced"
            value={inputs.slurryProduced}
            onChange={(v) => updateInput('slurryProduced', v)}
            unit="m³/year"
          />
          <InputField
            label="FYM Produced"
            value={inputs.FYMProduced}
            onChange={(v) => updateInput('FYMProduced', v)}
            unit="t/year"
            info="Farmyard Manure"
          />
          <InputField
            label="Storage Capacity"
            value={inputs.storageCapacity}
            onChange={(v) => updateInput('storageCapacity', v)}
            unit="months"
            min={0}
            step={0.5}
          />
        </div>

        {/* Outputs */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Farm Outputs</h3>
          <InputField
            label="Milk Sold"
            value={inputs.milkSold}
            onChange={(v) => updateInput('milkSold', v)}
            unit="L/year"
            step={1000}
          />
          <InputField
            label="Cull Cows"
            value={inputs.culls}
            onChange={(v) => updateInput('culls', v)}
            unit="head/year"
          />
          <InputField
            label="Beef Calves"
            value={inputs.calvesBeef}
            onChange={(v) => updateInput('calvesBeef', v)}
            unit="head/year"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Calculate Balance
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Step 3: Results & Report
  const ResultsReport = () => {
    if (!balance) return null;

    const getComplianceColor = (compliant) => compliant ? 'text-green-600' : 'text-red-600';
    const getComplianceIcon = (compliant) => compliant ? CheckCircle : AlertTriangle;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Nutrient Balance Results - {currentFarm?.name}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Inputs
            </button>
            <button
              onClick={() => {
                setShowReport(true);
                setTimeout(() => window.print(), 100);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">N Efficiency</div>
            <div className="text-2xl font-bold text-gray-900">{balance.nEfficiency.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Target: >65%</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">P Efficiency</div>
            <div className="text-2xl font-bold text-gray-900">{balance.pEfficiency.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Target: >70%</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">N Balance</div>
            <div className="text-2xl font-bold text-gray-900">{balance.nBalancePerHa.toFixed(0)} kg/ha</div>
            <div className="text-xs text-gray-500">Surplus N per hectare</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Organic N</div>
            <div className="text-2xl font-bold text-gray-900">{balance.organicNPerHa.toFixed(0)} kg/ha</div>
            <div className="text-xs text-gray-500">NVZ limit: 170 kg/ha</div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            NVZ Compliance Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {React.createElement(getComplianceIcon(balance.organicNCompliant), {
                className: `w-5 h-5 ${getComplianceColor(balance.organicNCompliant)}`
              })}
              <span className={`font-medium ${getComplianceColor(balance.organicNCompliant)}`}>
                Organic N Loading: {balance.organicNCompliant ? 'Compliant' : 'Exceeds Limit'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {React.createElement(getComplianceIcon(balance.storageCompliant), {
                className: `w-5 h-5 ${getComplianceColor(balance.storageCompliant)}`
              })}
              <span className={`font-medium ${getComplianceColor(balance.storageCompliant)}`}>
                Storage: {inputs.storageCapacity} months {balance.storageCompliant ? '✓' : '(Need 5+)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {React.createElement(getComplianceIcon(balance.nvzCompliant), {
                className: `w-5 h-5 ${getComplianceColor(balance.nvzCompliant)}`
              })}
              <span className={`font-medium ${getComplianceColor(balance.nvzCompliant)}`}>
                Overall: {balance.nvzCompliant ? 'Compliant' : 'Action Required'}
              </span>
            </div>
          </div>
        </div>

        {/* Nutrient Flow Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Nitrogen Balance */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Nitrogen Balance (kg/year)</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Inputs</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Feed</span>
                    <span className="font-medium">{(balance.nInputs.concentrates + balance.nInputs.protein).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fertilizer</span>
                    <span className="font-medium">{(balance.nInputs.ammoniumNitrate + balance.nInputs.urea).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fixation</span>
                    <span className="font-medium">{balance.nInputs.fixation.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposition</span>
                    <span className="font-medium">{balance.nInputs.deposition.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">{balance.totalNInputs.toFixed(0)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Outputs</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Milk</span>
                    <span className="font-medium">{balance.nOutputs.milk.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livestock</span>
                    <span className="font-medium">{(balance.nOutputs.culls + balance.nOutputs.calves).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crops</span>
                    <span className="font-medium">{(balance.nOutputs.silage + balance.nOutputs.wheat).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Losses</span>
                    <span className="font-medium">{(balance.nOutputs.ammonia + balance.nOutputs.leaching).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">{balance.totalNOutputs.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded text-sm">
              <div className="font-medium text-gray-900">N Surplus: {balance.nBalance.toFixed(0)} kg/year</div>
              <div className="text-gray-600">({balance.nBalancePerHa.toFixed(0)} kg/ha)</div>
            </div>
          </div>

          {/* Phosphorus Balance */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Phosphorus Balance (kg/year)</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Inputs</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Feed</span>
                    <span className="font-medium">{(balance.pInputs.concentrates + balance.pInputs.protein).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fertilizer</span>
                    <span className="font-medium">{balance.pInputs.TSP.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-2">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">{balance.totalPInputs.toFixed(0)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Outputs</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Milk</span>
                    <span className="font-medium">{balance.pOutputs.milk.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livestock</span>
                    <span className="font-medium">{(balance.pOutputs.culls + balance.pOutputs.calves).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crops</span>
                    <span className="font-medium">{(balance.pOutputs.silage + balance.pOutputs.wheat).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-2">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">{balance.totalPOutputs.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded text-sm">
              <div className="font-medium text-gray-900">P Surplus: {balance.pBalance.toFixed(0)} kg/year</div>
              <div className="text-gray-600">({balance.pBalancePerHa.toFixed(0)} kg/ha)</div>
            </div>
          </div>
        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">N Input Sources</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Feed', value: balance.nInputs.concentrates + balance.nInputs.protein, fill: '#3b82f6' },
                    { name: 'Fertilizer', value: balance.nInputs.ammoniumNitrate + balance.nInputs.urea, fill: '#10b981' },
                    { name: 'Fixation', value: balance.nInputs.fixation, fill: '#f59e0b' },
                    { name: 'Deposition', value: balance.nInputs.deposition, fill: '#8b5cf6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {[0, 1, 2, 3].map((index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(0)} kg`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Efficiency Comparison</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { nutrient: 'Nitrogen', efficiency: balance.nEfficiency, target: 65 },
                { nutrient: 'Phosphorus', efficiency: balance.pEfficiency, target: 70 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nutrient" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Bar dataKey="efficiency" fill="#3b82f6" name="Current" />
                <Bar dataKey="target" fill="#e5e7eb" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-blue-600" />
            Recommendations for Improvement
          </h3>
          <div className="space-y-2 text-sm">
            {balance.nEfficiency < 65 && (
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Nitrogen efficiency is below target. Consider reducing fertilizer inputs or improving feed conversion.</span>
              </div>
            )}
            {balance.organicNPerHa > NVZ_LIMITS.nMax && (
              <div className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>Organic nitrogen loading exceeds NVZ limit. Increase land area for spreading or export manure.</span>
              </div>
            )}
            {inputs.storageCapacity < NVZ_LIMITS.storageMonths && (
              <div className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>Storage capacity below NVZ requirement. Increase to minimum 5 months capacity.</span>
              </div>
            )}
            {balance.nBalancePerHa > 100 && (
              <div className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>High nitrogen surplus. Review fertilizer application rates and timing.</span>
              </div>
            )}
            {balance.pBalancePerHa > 10 && (
              <div className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Phosphorus accumulation risk. Reduce P fertilizer inputs based on soil analysis.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Print styles
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      #printable-report, #printable-report * {
        visibility: visible;
      }
      #printable-report {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
      .print-break {
        page-break-after: always;
      }
    }
  `;

  // Main render
  return (
    <>
      <style>{printStyles}</style>
      
      {/* Main Application */}
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nutrient Budget Calculator</h1>
                <p className="text-sm text-gray-600">Pilot Program - 10 Dairy Farms</p>
              </div>
              <div className="flex items-center gap-4">
                {lastSaved && (
                  <div className="text-sm text-gray-500">
                    Saved: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
                <button
                  onClick={() => {
                    if (confirm('Download all farm data as JSON?')) {
                      const dataStr = JSON.stringify(farmData, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const exportFileDefaultName = `nutrient_budget_data_${new Date().toISOString().split('T')[0]}.json`;
                      
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', exportFileDefaultName);
                      linkElement.click();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Save className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-24 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-24 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step Labels */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-16 text-sm">
              <span className={currentStep === 1 ? 'font-medium text-gray-900' : 'text-gray-500'}>
                Select Farm
              </span>
              <span className={currentStep === 2 ? 'font-medium text-gray-900' : 'text-gray-500'}>
                Enter Data
              </span>
              <span className={currentStep === 3 ? 'font-medium text-gray-900' : 'text-gray-500'}>
                View Report
              </span>
            </div>
          </div>

          {/* Content based on step */}
          {currentStep === 1 && <FarmSelection />}
          {currentStep === 2 && <InputData />}
          {currentStep === 3 && <ResultsReport />}
        </div>
      </div>

      {/* Printable Report */}
      {showReport && (
        <div id="printable-report" className="hidden print:block p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Nutrient Budget Report</h1>
            <p className="text-gray-600 mb-6">{currentFarm?.name} - {new Date().toLocaleDateString()}</p>
            
            <ResultsReport />
            
            <div className="mt-8 text-sm text-gray-600">
              <p>Generated by Nutrient Budget Calculator - Pilot Program</p>
              <p>This report is for advisory purposes only.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NutrientBudgetingMVP;