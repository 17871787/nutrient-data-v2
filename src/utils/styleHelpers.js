import { enableSoftShadow, enableLetterspace } from '../config/designFlags';

// Helper to conditionally apply soft shadows vs borders
export const getBorderOrShadow = (variant = 'default') => {
  const variants = {
    default: {
      border: 'border border-gray-300',
      shadow: 'shadow-sm hover:shadow-md border border-transparent'
    },
    card: {
      border: 'border border-gray-200',
      shadow: 'shadow-md hover:shadow-lg border border-transparent'
    },
    input: {
      border: 'border border-gray-300',
      shadow: 'shadow-sm focus:shadow-md border border-transparent'
    },
    button: {
      border: 'border border-gray-300',
      shadow: 'shadow hover:shadow-md border border-transparent'
    }
  };

  const style = variants[variant] || variants.default;
  return enableSoftShadow ? style.shadow : style.border;
};

// Helper for uppercase label classes
export const getUppercaseClasses = () => {
  return enableLetterspace ? 'uppercase uc-label' : 'uppercase';
};