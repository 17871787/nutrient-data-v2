import HighResolutionNutrientBudget from './components/HighResolutionNutrientBudget'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <HighResolutionNutrientBudget />
    </ErrorBoundary>
  )
}

export default App