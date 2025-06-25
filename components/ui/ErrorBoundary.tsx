import React, { Component, ReactNode } from 'react';
import { captureError, addBreadcrumb } from '../../src/config/sentry';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Capturar erro no Sentry
    try {
      addBreadcrumb('ErrorBoundary ativado', 'error');
      captureError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      });
    } catch (sentryError) {
      console.warn('Erro ao enviar para Sentry:', sentryError);
    }
    
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col justify-center items-center p-8 min-h-screen bg-red-50">
          <div className="p-6 w-full max-w-md bg-white rounded-lg border border-red-200 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="flex justify-center items-center mr-4 w-12 h-12 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-800">Erro na Aplicação</h2>
                <p className="text-sm text-red-600">Algo deu errado. Tente recarregar a página.</p>
              </div>
            </div>
            
            <div className="mb-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 w-full text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
              >
                🔄 Recarregar Página
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="p-3 mt-4 bg-gray-50 rounded border">
                <summary className="mb-2 text-sm font-medium text-gray-700 cursor-pointer">
                  Detalhes do Erro (Desenvolvimento)
                </summary>
                <pre className="overflow-auto max-h-32 text-xs text-gray-600">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <div className="pt-2 mt-2 border-t">
                      <strong>Component Stack:</strong>
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 