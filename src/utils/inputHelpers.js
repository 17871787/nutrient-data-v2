// Helper for parsing decimal inputs that may start with a decimal point
export function parseDecimal(value) {
  // Allow empty string or just a decimal point while typing
  if (value === '' || value === '.') {
    return value;
  }
  
  // Remove any non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  return cleaned;
}

// Convert parsed decimal to float, handling edge cases
export function safeParseFloat(value) {
  if (value === '' || value === '.') {
    return 0;
  }
  return parseFloat(value) || 0;
}