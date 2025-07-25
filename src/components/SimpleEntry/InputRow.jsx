import React from 'react';
import { AlertCircle } from 'lucide-react';

export function InputRow({ 
  label, 
  unit, 
  register, 
  field, 
  errors, 
  type = 'number',
  placeholder = '0',
  helpText = null,
  required = false,
  ...inputProps 
}) {
  // Extract nested error if field uses dot notation
  const getFieldError = (field, errors) => {
    const keys = field.split('.');
    let error = errors;
    for (const key of keys) {
      if (!error) return null;
      error = error[key];
    }
    return error;
  };

  const error = getFieldError(field, errors);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <label className="w-40 text-sm font-medium text-gray-700 flex-shrink-0">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="flex-1 relative">
          <input
            {...register(field, { 
              valueAsNumber: type === 'number',
              required: required ? `${label} is required` : false
            })}
            type={type === 'number' ? 'text' : type}
            inputMode={type === 'number' ? 'decimal' : 'text'}
            className={`w-full px-3 py-1.5 border rounded-md text-sm
                       ${error ? 'border-red-500 pr-8' : 'border-gray-300'}
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:bg-gray-100 disabled:cursor-not-allowed`}
            placeholder={placeholder}
            defaultValue={type === 'number' ? undefined : ''} // Let react-hook-form handle the default
            {...inputProps}
          />
          
          {error && (
            <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>
        
        {unit && (
          <span className="text-sm text-gray-500 flex-shrink-0 w-16">
            {unit}
          </span>
        )}
      </div>
      
      {(error || helpText) && (
        <div className="ml-40 mt-1">
          {error && (
            <p className="text-xs text-red-500">{error.message}</p>
          )}
          {helpText && !error && (
            <p className="text-xs text-gray-500">{helpText}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Variant for inline fields (e.g., nutrient percentages)
export function InlineInputRow({ 
  label, 
  unit, 
  register, 
  field, 
  errors,
  width = 'w-20',
  ...inputProps 
}) {
  const getFieldError = (field, errors) => {
    const keys = field.split('.');
    let error = errors;
    for (const key of keys) {
      if (!error) return null;
      error = error[key];
    }
    return error;
  };

  const error = getFieldError(field, errors);

  return (
    <div className="flex flex-col items-center gap-1">
      <label className="text-xs text-gray-600">{label}</label>
      <div className="relative">
        <input
          {...register(field, { valueAsNumber: true })}
          type="text"
          inputMode="decimal"
          className={`${width} px-2 py-1 border rounded text-sm text-center
                     ${error ? 'border-red-500' : 'border-gray-300'}
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          placeholder="0"
          {...inputProps}
        />
        {unit && (
          <span className="absolute -right-5 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 text-center">{error.message}</p>
      )}
    </div>
  );
}