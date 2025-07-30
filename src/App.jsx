import { useState } from 'react'
import HighResolutionNutrientBudget from './components/HighResolutionNutrientBudget'
import SimpleEntryMode from './components/SimpleEntry/SimpleEntryMode'
import ErrorBoundary from './components/ErrorBoundary'
import { getUIClasses } from './config/uiFeatures'
import { BrandLoader } from './BrandLoader'

function App() {
  const [mode, setMode] = useState('simple') // Start with simple mode
  const [initialData, setInitialData] = useState(null)
  const { branding } = BrandLoader()

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
      {branding && (
        <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <img 
              src={branding.logoUrl} 
              alt={branding.companyName} 
              className="h-12 object-contain drop-shadow-sm hover:drop-shadow-md transition-all duration-200"
            />
            <div className="text-right">
              <h2 className="text-sm font-semibold text-gray-800">Nutrient Data Calculator</h2>
              <p className="text-xs text-gray-500">Powered by {branding.companyName}</p>
            </div>
          </div>
        </div>
      )}
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