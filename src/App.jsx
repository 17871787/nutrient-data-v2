import { useState } from 'react'
import HighResolutionNutrientBudget from './components/HighResolutionNutrientBudget'
import SimpleEntryMode from './components/SimpleEntry/SimpleEntryMode'
import ErrorBoundary from './components/ErrorBoundary'
import { getUIClasses } from './config/uiFeatures'

function App() {
  const [mode, setMode] = useState('simple') // Start with simple mode
  const [initialData, setInitialData] = useState(null)

  // Handle switching from Simple to Pro mode
  const handleSwitchToPro = (data) => {
    setInitialData(data)
    setMode('pro')
  }

  // Handle switching back to Simple mode
  const handleSwitchToSimple = () => {
    setMode('simple')
  }

  // Handle saving data from Simple mode
  const handleSaveSimpleData = (data) => {
    console.log('Saving simple data:', data)
    // You can integrate this with localStorage or API here
    localStorage.setItem('simpleNutrientData', JSON.stringify(data))
  }

  return (
    <div className={getUIClasses()}>
      <ErrorBoundary>
        {mode === 'simple' ? (
          <SimpleEntryMode 
            onSwitchToPro={handleSwitchToPro}
            onSaveData={handleSaveSimpleData}
          />
        ) : (
          <HighResolutionNutrientBudget 
            initialData={initialData}
            onSwitchToSimple={handleSwitchToSimple}
          />
        )}
      </ErrorBoundary>
    </div>
  )
}

export default App