import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { InputRow } from './SimpleEntry/InputRow';
import { 
  annualFromPerCowDay, 
  annualFromPerL, 
  perCowDayFromAnnual, 
  perLFromAnnual 
} from '../utils/convert';
import { parseDecimal, safeParseFloat } from '../utils/inputHelpers';
import { enableEightPxGrid } from '../config/designFlags';
import { FORAGE_K_DEFAULTS } from '../constants/forageDefaults';
import { freshToDryT, proteinTonnes, cpPercentDM } from '../utils/forageMath';

// Helper to handle CP changes and calculate N%
const handleCPChange = (e, index, setValue) => {
  const cpValue = parseDecimal(e.target.value);
  const cp = safeParseFloat(cpValue);
  const n = cp / 6.25;
  setValue(`inputs.${index}.cpContent`, cp);
  setValue(`inputs.${index}.nContent`, Math.round(n * 100) / 100);
};

export function ConcentrateInput({ 
  index, 
  field, 
  register, 
  errors, 
  watch, 
  setValue, 
  removeInput,
  farmData
}) {
  const [mode, setMode] = useState(watch(`inputs.${index}.feedMode`) || 'annual');
  const [displayValues, setDisplayValues] = useState({});
  
  const cows = watch('farmInfo.milkingCows') || 0;
  const milkOutput = watch('outputs')?.find(o => o.type === 'milk');
  const milkL = milkOutput?.amount || 0;
  
  // Get current values
  const feed = {
    annualT: watch(`inputs.${index}.amount`) || 0,
    perCowDay: watch(`inputs.${index}.perCowDay`) || perCowDayFromAnnual(watch(`inputs.${index}.amount`) || 0, cows),
    perL: watch(`inputs.${index}.perL`) || perLFromAnnual(watch(`inputs.${index}.amount`) || 0, milkL)
  };

  const handleValueChange = (val, inputMode) => {
    let annual = feed.annualT;
    const cleanedVal = parseDecimal(val);
    
    // Update display value to allow typing decimals
    setDisplayValues(prev => ({ ...prev, [inputMode]: cleanedVal }));
    
    const numVal = safeParseFloat(cleanedVal);
    
    if (inputMode === 'annual') {
      annual = numVal;
    } else if (inputMode === 'perCowDay') {
      annual = annualFromPerCowDay(numVal, cows);
    } else if (inputMode === 'perL') {
      annual = annualFromPerL(numVal, milkL);
    }

    // Update all three values (round to 2 decimal for perCowDay and perL)
    setValue(`inputs.${index}.amount`, annual);
    setValue(`inputs.${index}.perCowDay`, Math.round(perCowDayFromAnnual(annual, cows) * 100) / 100);
    setValue(`inputs.${index}.perL`, Math.round(perLFromAnnual(annual, milkL) * 100) / 100);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setValue(`inputs.${index}.feedMode`, newMode);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-700">{field.label}</h3>
        <button
          type="button"
          onClick={() => removeInput(index)}
          className="text-red-500 hover:text-red-700"
          aria-label="Remove concentrate input"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Feed mode toggle */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Input Mode
        </label>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => handleModeChange('annual')}
            className={`px-3 py-1 rounded-md ${
              mode === 'annual'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            t per year
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('perCowDay')}
            className={`px-3 py-1 rounded-md ${
              mode === 'perCowDay'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            kg per cow day
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('perL')}
            className={`px-3 py-1 rounded-md ${
              mode === 'perL'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            kg per L milk
          </button>
        </div>
      </div>
      
      {/* Amount input based on mode */}
      <div>
        {mode === 'annual' && (
          <InputRow
            label="Amount"
            unit="t/yr"
            register={register}
            field={`inputs.${index}.amount`}
            errors={errors}
            helpText="Total annual concentrate usage"
            value={displayValues.annual ?? watch(`inputs.${index}.amount`) ?? ''}
            onChange={(e) => handleValueChange(e.target.value, 'annual')}
          />
        )}
        {mode === 'perCowDay' && (
          <InputRow
            label="Feed Rate"
            unit="kg/cow/day"
            register={register}
            field={`inputs.${index}.perCowDay`}
            errors={errors}
            step="0.1"
            helpText="Daily concentrate feeding rate per cow"
            value={displayValues.perCowDay ?? watch(`inputs.${index}.perCowDay`) ?? ''}
            onChange={(e) => handleValueChange(e.target.value, 'perCowDay')}
          />
        )}
        {mode === 'perL' && (
          <InputRow
            label="Feed Rate"
            unit="kg/L milk"
            register={register}
            field={`inputs.${index}.perL`}
            errors={errors}
            step="0.1"
            helpText="kg of feed per litre of milk (e.g., 0.3 = 300g concentrate per litre sold)"
            value={displayValues.perL ?? watch(`inputs.${index}.perL`) ?? ''}
            onChange={(e) => handleValueChange(e.target.value, 'perL')}
          />
        )}
        
        {/* Display helper line with all conversions */}
        <p className="text-xs text-gray-500 mt-1 ml-40">
          = {feed.perCowDay.toFixed(2)} kg cow⁻¹ day⁻¹ • {feed.perL.toFixed(2)} kg L⁻¹ • {feed.annualT.toFixed(0)} t/yr
        </p>
      </div>
      
      {/* Nutrient content inputs */}
      <div className={`grid grid-cols-2 ${enableEightPxGrid ? 'g-gap-3 g-mt-3' : 'gap-3 mt-3'}`}>
        <InputRow
          label="CP % (fresh weight)"
          unit="%"
          register={register}
          field={`inputs.${index}.cpContent`}
          errors={errors}
          step="0.1"
          helpText="Crude protein %"
          onChange={(e) => handleCPChange(e, index, setValue)}
        />
        <InputRow
          label="N Content"
          unit="%"
          register={register}
          field={`inputs.${index}.nContent`}
          errors={errors}
          step="0.1"
          helpText="Or enter directly"
        />
        <InputRow
          label="P Content"
          unit="%"
          register={register}
          field={`inputs.${index}.pContent`}
          errors={errors}
          step="0.01"
        />
        <InputRow
          label="K Content"
          unit="%"
          register={register}
          field={`inputs.${index}.kContent`}
          errors={errors}
          step="0.01"
        />
      </div>
    </div>
  );
}

export function ForageInput({ 
  index, 
  field, 
  register, 
  errors, 
  watch, 
  setValue, 
  removeInput,
  FORAGE_DEFAULTS 
}) {
  const cows = watch('farmInfo.milkingCows') || 0;
  const forageT = watch(`inputs.${index}.amount`) || 0;
  const foragePerCowDay = perCowDayFromAnnual(forageT, cows);
  const milkOutput = watch('outputs')?.find(o => o.type === 'milk');
  const milkL = milkOutput?.amount || 0;
  const foragePerL = perLFromAnnual(forageT, milkL);
  
  // Calculate derived values for display
  const dmPct = watch(`inputs.${index}.dmContent`) || 30;
  const cpFresh = watch(`inputs.${index}.cpContent`) || 0;
  const dryT = freshToDryT(forageT, dmPct);
  const proteinT = proteinTonnes(forageT, cpFresh);
  const cpDM = cpPercentDM(dmPct, cpFresh);

  // Helper to handle forage CP changes with DM% consideration
  const handleForageCPChange = (e) => {
    const cpValue = parseDecimal(e.target.value);
    const cpFresh = safeParseFloat(cpValue);
    setValue(`inputs.${index}.cpContent`, cpFresh);
    // Recalculate N based on new CP and current DM%
    const dmPct = watch(`inputs.${index}.dmContent`) || 30;
    const cpDM = cpFresh / (dmPct / 100);
    setValue(`inputs.${index}.nContent`, Math.round((cpDM / 6.25) * 100) / 100);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-700">{field.label}</h3>
        <button
          type="button"
          onClick={() => removeInput(index)}
          className="text-red-500 hover:text-red-700"
          aria-label="Remove forage input"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Forage type selector */}
      <div className="mb-3">
        <label htmlFor={`forage-type-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
          Forage Type
        </label>
        <select
          id={`forage-type-${index}`}
          {...register(`inputs.${index}.forageType`)}
          onChange={(e) => {
            const forageType = e.target.value;
            if (forageType && FORAGE_DEFAULTS[forageType]) {
              const defaults = FORAGE_DEFAULTS[forageType];
              const dmPct = defaults.dm || 30;
              const cpFresh = defaults.cp;
              
              setValue(`inputs.${index}.dmContent`, dmPct);
              setValue(`inputs.${index}.cpContent`, cpFresh);
              // Calculate N based on CP DM basis
              const cpDM = cpFresh / (dmPct / 100);
              setValue(`inputs.${index}.nContent`, cpDM / 6.25);
              
              // Set K% based on forage type (using new defaults)
              const kDefault = FORAGE_K_DEFAULTS[forageType] ?? 0.35; // Legacy default
              setValue(`inputs.${index}.kContent`, kDefault);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          aria-label="Select forage type"
        >
          <option value="">Select forage type...</option>
          {Object.entries(FORAGE_DEFAULTS).map(([key, forage]) => (
            <option key={key} value={key}>{forage.label}</option>
          ))}
        </select>
      </div>
      
      {/* Amount input */}
      <div>
        <InputRow
          label="Amount"
          unit="t/yr"
          register={register}
          field={`inputs.${index}.amount`}
          errors={errors}
        />
        
        {/* Display forage intake per cow per day and per L milk */}
        <p className="text-xs text-gray-500 mt-1 ml-40">
          ≈ {foragePerCowDay.toFixed(2)} kg cow⁻¹ day⁻¹ • {foragePerL.toFixed(2)} kg L⁻¹ • {forageT.toFixed(0)} t/yr
        </p>
      </div>
      
      {/* Display derived calculations */}
      <div className="text-xs text-gray-600 mt-2 ml-40">
        ≈ {dryT.toFixed(1)} t DM • {proteinT.toFixed(1)} t CP ({cpDM.toFixed(1)}% DM)
      </div>
      
      {/* DM% input */}
      <div className="mb-3">
        <InputRow
          label="DM %"
          unit="%"
          register={register}
          field={`inputs.${index}.dmContent`}
          errors={errors}
          step="1"
          helpText="Dry matter percentage"
          onChange={(e) => {
            const dmValue = parseFloat(e.target.value) || 30;
            setValue(`inputs.${index}.dmContent`, dmValue);
            // Recalculate N based on CP fresh and new DM%
            const cpFresh = watch(`inputs.${index}.cpContent`) || 0;
            const cpDM = cpFresh / (dmValue / 100);
            setValue(`inputs.${index}.nContent`, Math.round((cpDM / 6.25) * 100) / 100);
          }}
        />
      </div>
      
      {/* Nutrient content inputs */}
      <div className={`grid grid-cols-2 ${enableEightPxGrid ? 'g-gap-3' : 'gap-3'}`}>
        <InputRow
          label="CP % (fresh weight)"
          unit="%"
          register={register}
          field={`inputs.${index}.cpContent`}
          errors={errors}
          step="0.1"
          helpText="Crude protein %"
          onChange={handleForageCPChange}
        />
        <InputRow
          label="N Content"
          unit="%"
          register={register}
          field={`inputs.${index}.nContent`}
          errors={errors}
          step="0.1"
          helpText="Or enter directly"
        />
        <InputRow
          label="P Content"
          unit="%"
          register={register}
          field={`inputs.${index}.pContent`}
          errors={errors}
          step="0.01"
        />
        <InputRow
          label="K Content"
          unit="%"
          register={register}
          field={`inputs.${index}.kContent`}
          errors={errors}
          step="0.01"
          helpText="Auto-fills based on forage type"
        />
      </div>
    </div>
  );
}