import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { enableHeadingStyles, enableLetterspace, enableMutedPalette, enableHoverTransitions, enableFocusGlow } from './config/designFlags'

// Apply HTML class toggles for UI features
if (enableHeadingStyles) {
  document.documentElement.classList.add('beta-heading-styles');
}
if (enableLetterspace) {
  document.documentElement.classList.add('beta-letterspace');
}
if (enableMutedPalette) {
  document.documentElement.classList.add('beta-muted');
}
if (enableHoverTransitions) {
  document.documentElement.classList.add('beta-transitions');
}
if (enableFocusGlow) {
  document.documentElement.classList.add('beta-focus-glow');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)