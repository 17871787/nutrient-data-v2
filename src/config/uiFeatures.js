/**
 * UI Feature Toggles Configuration
 * Enable/disable new UI improvements by setting these flags
 */

export const UI_FEATURES = {
  // UI Improvement #1: Golden Ratio Type Scale
  // Implements mathematical type scale for better visual hierarchy
  goldenRatioTypography: true,

  // UI Improvement #2: Subtle Text Shadows
  // Adds subtle shadows for improved text legibility
  textShadows: true,

  // UI Improvement #3: Enhanced Line Height
  // Increases line-height to 1.5x-1.75x for better readability
  enhancedLineHeight: true,
};

/**
 * Get CSS classes based on enabled features
 * @returns {string} Space-separated CSS classes
 */
export function getUIClasses() {
  const classes = [];
  
  if (UI_FEATURES.goldenRatioTypography) {
    classes.push('beta-typography');
  }
  
  if (UI_FEATURES.textShadows) {
    classes.push('beta-shadows');
  }
  
  if (UI_FEATURES.enhancedLineHeight) {
    classes.push('beta-line-height');
  }
  
  return classes.join(' ');
}