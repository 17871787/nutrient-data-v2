import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // You could also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Clear localStorage if the error might be data-related
    if (this.state.errorCount > 2) {
      const confirmClear = window.confirm(
        'Multiple errors detected. Would you like to clear stored data and start fresh?'
      );
      if (confirmClear) {
        localStorage.removeItem('nutrientBudgetAdvanced');
      }
    }

    // Reset error boundary state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });

    // Reload the page
    window.location.reload();
  };

  handleGoHome = () => {
    // Reset state and go to home view
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // If using routing, navigate to home
    // For now, just reload
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 mt-1">
                  An unexpected error occurred in the application
                </p>
              </div>
            </div>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <h2 className="font-semibold text-gray-700 mb-2">Error Details:</h2>
                <pre className="text-sm text-gray-600 overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                      Component Stack
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>
            </div>

            {/* Additional help text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tips:</strong> This error might be caused by corrupted data or a temporary issue. 
                Try refreshing the page. If the problem persists, you may need to clear your browser's 
                local storage for this site.
              </p>
            </div>

            {/* Error count warning */}
            {this.state.errorCount > 2 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Multiple errors detected:</strong> The application has encountered {this.state.errorCount} errors. 
                  Consider clearing stored data when you retry.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Return children if no error
    return this.props.children;
  }
}

export default ErrorBoundary;