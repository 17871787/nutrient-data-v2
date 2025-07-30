import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Download,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  ArrowRight,
  Tractor,
  Package,
  Milk,
  Droplets,
  BarChart3,
  Info
} from 'lucide-react';
import { simpleEntrySchema, DEFAULT_FORM_VALUES, DEFAULT_NUTRIENT_CONTENTS } from '../../schemas/simpleEntrySchema';
import { InputRow, InlineInputRow } from './InputRow';
import { calculateSimpleBalance } from '../../utils/simpleCalculations';
import { transformToKOUs } from '../../utils/dataTransformers';
import GHGIndicator from '../GHGIndicator';
import { ConcentrateInput, ForageInput } from '../FeedInputs';
import { FertilizerInput } from '../InputsTab';

const STEPS = [
  { id: 'farm', label: 'Farm Basics', icon: Tractor },
  { id: 'inputs', label: 'Nutrient Inputs', icon: Package },
  { id: 'outputs', label: 'Nutrient Outputs', icon: Milk },
  { id: 'manure', label: 'Manure & Losses', icon: Droplets },
  { id: 'review', label: 'Review & Save', icon: BarChart3 },
];

// Forage type defaults with CP% on DM basis and default DM%
const FORAGE_DEFAULTS = {
  'grass_silage': { label: 'Grass Silage', cp: 14, dm: 30 },
  'grazed_grass': { label: 'Grazed Grass', cp: 22, dm: 22 },
  'wholecrop_cereal': { label: 'Whole-crop Cereal Silage', cp: 8, dm: 35 },
  'maize_silage': { label: 'Maize Silage', cp: 8, dm: 30 },
  'hay': { label: 'Hay', cp: 11, dm: 85 },
  'straw': { label: 'Straw', cp: 3.5, dm: 85 }
};

// Fertilizer type defaults with N-availability factors
const FERTILIZER_TYPES = {
  'ammonium_nitrate': { label: 'Ammonium Nitrate (34.5% N)', n: 34.5, availabilityN: 1.0 },
  'urea': { label: 'Urea (46% N)', n: 46, availabilityN: 1.0 },
  'uan': { label: 'UAN Solution (28-32% N)', n: 30, availabilityN: 1.0 },
  'chicken_litter': { label: 'Chicken Litter', n: 3.5, availabilityN: 0.35 },
  'composted_fym': { label: 'Composted FYM', n: 0.6, availabilityN: 0.1 },
  'fresh_fym': { label: 'Fresh FYM', n: 0.6, availabilityN: 0.25 },
  'biosolids': { label: 'Biosolids/Sewage Sludge', n: 4.5, availabilityN: 0.15 },
  'custom': { label: 'Custom/Other', n: 0, availabilityN: 1.0 }
};

export default function SimpleEntryMode({ onSwitchToPro, onSaveData }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(simpleEntrySchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
  });

  const { fields: inputFields, append: appendInput, remove: removeInput } = useFieldArray({
    control,
    name: 'inputs',
  });

  const { fields: outputFields } = useFieldArray({
    control,
    name: 'outputs',
  });

  const watchedValues = watch();

  // Calculate nutrient balance for review
  const nutrientBalance = calculateSimpleBalance(watchedValues);

  // Navigation handlers
  const handleNext = async () => {
    const stepFields = {
      0: ['farmInfo'],
      1: ['inputs'],
      2: ['outputs'],
      3: ['manure'],
    };

    const isValid = await trigger(stepFields[currentStep]);
    
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Export data as JSON
  const handleExport = () => {
    const data = getValues();
    const exportData = {
      ...data,
      calculatedBalance: nutrientBalance,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrient-budget-${data.farmInfo.name || 'farm'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Switch to Pro mode
  const handleSwitchToPro = () => {
    const data = getValues();
    const { kous, pathways } = transformToKOUs(data);
    onSwitchToPro({ kous, pathways, simpleData: data });
  };

  // Add new input row
  const addInputRow = (type) => {
    const defaults = DEFAULT_NUTRIENT_CONTENTS[type] || { cp: 0, n: 0, p: 0, k: 0, s: 0 };
    const labels = {
      concentrate: 'Concentrates',
      silage: 'Forage',
      hay: 'Hay',
      straw: 'Straw',
      fertiliser_N: 'N Fertiliser',
      fertiliser_P: 'P Fertiliser',
      fertiliser_compound: 'Compound Fertiliser',
    };
    
    appendInput({
      source: type,
      label: labels[type] || type,
      amount: 0,
      cpContent: defaults.cp,
      nContent: defaults.n,
      pContent: defaults.p,
      kContent: defaults.k,
      sContent: defaults.s,
    });
  };

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${index < currentStep ? 'bg-primary border-primary text-white' : ''}
                  ${index === currentStep ? 'border-primary text-primary' : ''}
                  ${index > currentStep ? 'border-gray-300 text-gray-400' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors
                    ${index < currentStep ? 'bg-primary' : 'bg-gray-300'}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        {STEPS.map((step) => (
          <span key={step.id} className="text-center flex-1">
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Farm Basics
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Farm Information</h2>
            <InputRow
              label="Farm Name"
              register={register}
              field="farmInfo.name"
              errors={errors}
              type="text"
              required
              placeholder="Enter farm name"
            />
            <InputRow
              label="Total Farm Area"
              unit="ha"
              register={register}
              field="farmInfo.totalArea"
              errors={errors}
              required
              helpText="Total hectares of agricultural land"
            />
            <InputRow
              label="Milking Cows"
              unit="head"
              register={register}
              field="farmInfo.milkingCows"
              errors={errors}
              required
              helpText="Number of milking cows in the herd"
            />
            <InputRow
              label="Youngstock (0-12 months)"
              unit="head"
              register={register}
              field="farmInfo.youngstock0_12"
              errors={errors}
              helpText="Calves and youngstock up to 12 months old"
            />
            <InputRow
              label="Youngstock (12m to calving)"
              unit="head"
              register={register}
              field="farmInfo.youngstock12_calving"
              errors={errors}
              helpText="Heifers from 12 months to first calving"
            />
            <InputRow
              label="Average Milk Protein"
              unit="%"
              register={register}
              field="farmInfo.milkCPpct"
              errors={errors}
              helpText="Used to calculate milk nitrogen output (CP ÷ 6.25)"
            />
          </div>
        );

      case 1: // Nutrient Inputs
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Feed & Fertiliser Inputs</h2>
            
            {/* Group inputs by type */}
            {inputFields.some(f => f.source === 'concentrate') && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 mt-6 flex items-center gap-1">
                  Purchased Feed
                  <span className="text-xs text-gray-500 font-normal">
                    (include young-stock)
                  </span>
                  <Info className="w-4 h-4 text-gray-400 cursor-help ml-1"
                        title="Young-stock intake is part of the farm nitrogen balance. Excluding it will inflate NUE."
                        aria-label="Young-stock intake is part of the farm nitrogen balance. Excluding it will inflate NUE."/>
                </h4>
                <div className="space-y-4">
                  {inputFields.filter(f => f.source === 'concentrate').map((field, idx) => {
                    const index = inputFields.findIndex(f => f.id === field.id);
                    return (
                      <ConcentrateInput
                        key={field.id}
                        index={index}
                        field={field}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        removeInput={removeInput}
                        farmData={watchedValues}
                      />
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => addInputRow('concentrate')}
                  className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add concentrate
                </button>
              </div>
            )}
            
            {/* Forage section */}
            {inputFields.some(f => ['silage', 'hay', 'straw'].includes(f.source)) && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 mt-6 flex items-center gap-1">
                  Forage Production / Use
                  <span className="text-xs text-gray-500 font-normal">
                    (totals incl. young-stock)
                  </span>
                  <Info className="w-4 h-4 text-gray-400 cursor-help ml-1"
                        title="Young-stock intake is part of the farm nitrogen balance. Excluding it will inflate NUE."
                        aria-label="Young-stock intake is part of the farm nitrogen balance. Excluding it will inflate NUE."/>
                </h4>
                <div className="space-y-4">
                  {inputFields.filter(f => ['silage', 'hay', 'straw'].includes(f.source)).map((field) => {
                    const index = inputFields.findIndex(f => f.id === field.id);
                    return (
                      <ForageInput
                        key={field.id}
                        index={index}
                        field={field}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        removeInput={removeInput}
                        FORAGE_DEFAULTS={FORAGE_DEFAULTS}
                      />
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => addInputRow('silage')}
                  className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add forage
                </button>
              </div>
            )}
            
            {/* Fertilizer section */}
            {inputFields.some(f => f.source.includes('fertiliser')) && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 mt-6">Fertilisers</h4>
                <div className="space-y-4">
                  {inputFields.filter(f => f.source.includes('fertiliser')).map((field) => {
                    const index = inputFields.findIndex(f => f.id === field.id);
                    return (
                      <FertilizerInput
                        key={field.id}
                        index={index}
                        field={field}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        removeInput={removeInput}
                        FERTILIZER_TYPES={FERTILIZER_TYPES}
                      />
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => addInputRow('fertiliser_N')}
                  className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add fertiliser
                </button>
              </div>
            )}
            
            {/* Original mapping for any other types */}
            <div className="space-y-4">
              {inputFields.filter(f => 
                f.source !== 'concentrate' && 
                !['silage', 'hay', 'straw'].includes(f.source) && 
                !f.source.includes('fertiliser')
              ).map((field) => {
                const index = inputFields.findIndex(f => f.id === field.id);
                return (
                  <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700">{field.label}</h3>
                      <button
                        type="button"
                        onClick={() => removeInput(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <InputRow
                        label="Amount"
                        unit="t/yr"
                        register={register}
                        field={`inputs.${index}.amount`}
                        errors={errors}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        );

      case 2: // Nutrient Outputs
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Farm Outputs</h2>
            
            {outputFields.map((field, index) => {
              const milkingCows = watch('farmInfo.milkingCows') || 1;
              const milkAmount = field.type === 'milk' ? watch(`outputs.${index}.amount`) || 0 : 0;
              const litresPerCow = field.type === 'milk' && milkingCows > 0 ? Math.round(milkAmount / milkingCows) : 0;
              
              return (
                <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-3">{field.label}</h3>
                  
                  {field.type === 'milk' ? (
                    <InputRow
                      label="Amount"
                      unit="litres/yr"
                      register={register}
                      field={`outputs.${index}.amount`}
                      errors={errors}
                      helpText="Total annual milk production in litres"
                    />
                  ) : (
                    <>
                      <InputRow
                        label="Number of Cull Cows"
                        unit="head/yr"
                        register={register}
                        field={`outputs.${index}.number`}
                        errors={errors}
                        helpText="Number of cows culled per year"
                        step="1"
                      />
                      <InputRow
                        label="Average Live-Weight"
                        unit="kg"
                        register={register}
                        field={`outputs.${index}.avgWeightKg`}
                        errors={errors}
                        helpText="Average live-weight per cow (typical kill-out 54%)"
                        step="10"
                      />
                    </>
                  )}
                  
                  {field.type === 'milk' && milkingCows > 0 && (
                    <div className="mt-2 text-sm text-gray-600 ml-40">
                      = {litresPerCow.toLocaleString()} litres/cow/year
                    </div>
                  )}
                
                {field.type === 'milk' && (
                  <div className="flex gap-4 mt-3">
                    <InlineInputRow
                      label="Butter-fat %"
                      register={register}
                      field={`outputs.${index}.fatPct`}
                      errors={errors}
                      helpText="Typical: 3.8-4.5%"
                    />
                    <InlineInputRow
                      label="Protein %"
                      register={register}
                      field={`outputs.${index}.proteinPct`}
                      errors={errors}
                      helpText="Typical: 3.0-3.5%"
                    />
                  </div>
                )}
                
                <div className="flex gap-4 mt-3">
                  {field.type === 'milk' ? (
                    <div className="flex flex-col items-center gap-1">
                      <label className="text-xs text-gray-600">N %</label>
                      <div className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center bg-gray-100">
                        {((watch(`outputs.${index}.proteinPct`) || 3.3) * 0.16).toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <InlineInputRow
                      label="N %"
                      register={register}
                      field={`outputs.${index}.nContent`}
                      errors={errors}
                    />
                  )}
                  <InlineInputRow
                    label="P %"
                    register={register}
                    field={`outputs.${index}.pContent`}
                    errors={errors}
                  />
                </div>
              </div>
              );
            })}
          </div>
        );

      case 3: // Manure & Losses
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Manure Management</h2>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">Slurry Application</h3>
              
              <InputRow
                label="Slurry Applied"
                unit="m³/yr"
                register={register}
                field="manure.slurryApplied"
                errors={errors}
                helpText="Total volume of slurry applied to land"
              />
              
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <InputRow
                    label="N Content"
                    unit="kg/m³"
                    register={register}
                    field="manure.slurryNContent"
                    errors={errors}
                    helpText="Typical: 2-3 kg/m³"
                  />
                </div>
                <div className="flex-1">
                  <InputRow
                    label="P Content"
                    unit="kg/m³"
                    register={register}
                    field="manure.slurryPContent"
                    errors={errors}
                    helpText="Typical: 0.4-0.6 kg/m³"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <InputRow
                  label="N Availability"
                  unit="%"
                  register={register}
                  field="manure.slurryAvailabilityN"
                  errors={errors}
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  helpText="Percentage of slurry N available in first season (typical: 35-50%)"
                  defaultValue={45}
                />
              </div>
            </div>
            
            {/* Slurry Imports */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">Slurry Imports</h3>
              
              <InputRow
                label="Imported Slurry Volume"
                unit="m³/yr"
                register={register}
                field="manure.slurryImported"
                errors={errors}
                helpText="Volume of slurry brought onto the farm"
              />
              
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <InputRow
                    label="N Content"
                    unit="kg/m³"
                    register={register}
                    field="manure.slurryImportedNContent"
                    errors={errors}
                    helpText="Typical: 2-3 kg/m³"
                  />
                </div>
                <div className="flex-1">
                  <InputRow
                    label="P Content"
                    unit="kg/m³"
                    register={register}
                    field="manure.slurryImportedPContent"
                    errors={errors}
                    helpText="Typical: 0.4-0.6 kg/m³"
                  />
                </div>
              </div>
            </div>
            
            {/* Slurry Exports */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">Slurry Exports</h3>
              
              <InputRow
                label="Exported Slurry Volume"
                unit="m³/yr"
                register={register}
                field="manure.slurryExported"
                errors={errors}
                helpText="Volume of slurry removed from the farm"
              />
              
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <InputRow
                    label="N Content"
                    unit="kg/m³"
                    register={register}
                    field="manure.slurryExportedNContent"
                    errors={errors}
                    helpText="Typical: 2-3 kg/m³"
                  />
                </div>
                <div className="flex-1">
                  <InputRow
                    label="P Content"
                    unit="kg/m³"
                    register={register}
                    field="manure.slurryExportedPContent"
                    errors={errors}
                    helpText="Typical: 0.4-0.6 kg/m³"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Review & Save
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Summary & Compliance</h2>
            
            {/* NVZ Compliance Alert */}
            <div className={`rounded-lg p-4 border-2 ${
              nutrientBalance.nvzCompliant 
                ? 'bg-green-50 border-green-300 alert-success' 
                : 'bg-red-50 border-red-300 alert-error'
            }`}>
              <div className="flex items-center gap-2">
                {nutrientBalance.nvzCompliant ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <h3 className="font-bold text-gray-900">
                    NVZ Compliance: {nutrientBalance.organicNPerHa.toFixed(0)} kg N/ha
                  </h3>
                  <p className="text-sm text-gray-600">
                    {nutrientBalance.nvzCompliant 
                      ? 'Within the 170 kg/ha limit' 
                      : `Exceeds limit by ${(nutrientBalance.organicNPerHa - 170).toFixed(0)} kg/ha`}
                  </p>
                </div>
              </div>
            </div>

            {/* Nutrient Balance Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Total Inputs</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Nitrogen:</span>
                    <span className="font-bold">{nutrientBalance.totalInputs.N.toFixed(0)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phosphorus:</span>
                    <span className="font-bold">{nutrientBalance.totalInputs.P.toFixed(0)} kg</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Total Outputs</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Nitrogen:</span>
                    <span className="font-bold">{nutrientBalance.totalOutputs.N.toFixed(0)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phosphorus:</span>
                    <span className="font-bold">{nutrientBalance.totalOutputs.P.toFixed(0)} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Farm Efficiency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-light rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Nitrogen Use Efficiency (NUE)</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>N Efficiency</span>
                      <span className="font-bold">{nutrientBalance.nEfficiency.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min(nutrientBalance.nEfficiency, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Based on effective N inputs
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Phosphorus Use Efficiency (PUE)</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>P Efficiency</span>
                      <span className="font-bold">{nutrientBalance.pEfficiency.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${Math.min(nutrientBalance.pEfficiency, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      P outputs ÷ P inputs × 100
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* GHG Indicator */}
            <GHGIndicator 
              nue={nutrientBalance.nEfficiency} 
              system="mixed"
              showDetails={true}
            />

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={handleSwitchToPro}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Switch to Pro Mode
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Debug banner */}
      {new URLSearchParams(window.location.search).get('debug') === '1' && (
        <div className="max-w-2xl mx-auto mb-4">
          <details className="bg-gray-800 text-white p-4 rounded">
            <summary className="cursor-pointer font-mono text-sm">Debug Data</summary>
            <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(watchedValues, null, 2)}</pre>
          </details>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Simple Nutrient Budget Entry</h1>
          
          <ProgressBar />
          
          <form onSubmit={handleSubmit(onSaveData)}>
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                  ${currentStep === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              
              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Data
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}