import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isRetrying: boolean;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isRetrying: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRetrying: false, retryCount: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if this is a dynamic import failure
    const isDynamicImportError = error.message.includes('Failed to fetch dynamically imported module') ||
                                error.message.includes('Loading chunk') ||
                                error.message.includes('Loading CSS chunk');
    
    if (isDynamicImportError) {
      console.log('Detected dynamic import failure, attempting automatic retry...');
      this.handleRetry();
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount >= 3) {
      return;
    }

    this.setState({ isRetrying: true });
    
    setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        isRetrying: false,
        retryCount: prevState.retryCount + 1
      }));
    }, 1000 * (this.state.retryCount + 1)); // Exponential backoff
  };

  private handleReload = () => {
    window.location.reload();
  };

  private clearCacheAndReload = async () => {
    try {
      // Clear service worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear localStorage if needed
      localStorage.removeItem('sw-cache-invalidated');
      
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      window.location.reload();
    }
  };

  public render() {
    if (this.state.isRetrying) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">
              Retrying...
            </h2>
            
            <p className="text-gray-400 mb-6">
              Attempting to reload the page content (Attempt {this.state.retryCount + 1}/3)
            </p>
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDynamicImportError = this.state.error?.message.includes('Failed to fetch dynamically imported module') ||
                                 this.state.error?.message.includes('Loading chunk') ||
                                 this.state.error?.message.includes('Loading CSS chunk');

      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {isDynamicImportError ? (
                <WifiOff className="h-8 w-8 text-red-400" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-400" />
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">
              {isDynamicImportError ? 'Loading Issue' : 'Something went wrong'}
            </h2>
            
            <p className="text-gray-400 mb-6">
              {isDynamicImportError 
                ? 'Failed to load page content. This is usually due to a network issue or outdated cache.'
                : 'An error occurred while loading this page. This might be due to a temporary server issue.'
              }
            </p>

            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-gray-300 cursor-pointer hover:text-white">
                  Error Details
                </summary>
                <pre className="mt-2 p-3 bg-gray-900 rounded text-xs text-red-400 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center flex-wrap">
              {this.state.retryCount < 3 && (
                <Button
                  onClick={this.handleRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              <Button
                onClick={this.handleReload}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>

              {isDynamicImportError && (
                <Button
                  onClick={this.clearCacheAndReload}
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Clear Cache & Reload
                </Button>
              )}
              
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;