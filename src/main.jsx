import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { enableHeadingStyles, enableLetterspace } from './config/designFlags'

// Apply HTML class toggles for UI features
if (enableHeadingStyles) {
  document.documentElement.classList.add('beta-heading-styles');
}
if (enableLetterspace) {
  document.documentElement.classList.add('beta-letterspace');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)