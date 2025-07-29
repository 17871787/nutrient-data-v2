import React from 'react';
import { Trash2 } from 'lucide-react';
import { InputRow } from './SimpleEntry/InputRow';

export function FertilizerInput({ 
  index, 
  field, 
  register, 
  errors, 
  watch, 
  setValue, 
  removeInput,
  FERTILIZER_TYPES 
}) {
  const farmInfo = watch('farmInfo') || {};
  const totalArea = farmInfo.totalArea || 0;
  const fertNkg = watch(`inputs.${index}.amount`) || 0;
  const kgNha = totalArea > 0 ? fertNkg / totalArea : 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
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
      
      {/* Fertilizer type selector */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fertilizer Type
        </label>
        <select
          {...register(`inputs.${index}.fertilizerType`)}
          onChange={(e) => {
            const fertType = e.target.value;
            if (fertType && FERTILIZER_TYPES[fertType]) {
              const nDefault = FERTILIZER_TYPES[fertType].n;
              setValue(`inputs.${index}.nContent`, nDefault);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select fertilizer type...</option>
          {Object.entries(FERTILIZER_TYPES).map(([key, fert]) => (
            <option key={key} value={key}>{fert.label}</option>
          ))}
        </select>
      </div>
      
      {/* Amount input */}
      <div>
        <InputRow
          label="Amount"
          unit="kg/yr"
          register={register}
          field={`inputs.${index}.amount`}
          errors={errors}
        />
        
        {/* Display N application rate per hectare */}
        {field.source.includes('fertiliser_N') && (
          <p className="text-xs text-gray-500 mt-1 ml-40">
            = {kgNha.toFixed(1)} kg N ha⁻¹
          </p>
        )}
      </div>
      
      {/* Nutrient content inputs */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <InputRow
          label="N Content"
          unit="%"
          register={register}
          field={`inputs.${index}.nContent`}
          errors={errors}
          step="0.1"
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
        <InputRow
          label="S Content"
          unit="%"
          register={register}
          field={`inputs.${index}.sContent`}
          errors={errors}
          step="0.01"
        />
      </div>
    </div>
  );
}