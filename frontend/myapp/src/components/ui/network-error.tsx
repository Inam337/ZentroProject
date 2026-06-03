'use client';

import React from 'react';
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

import { useNetworkStatus } from '@/utils/network-error-handler';

interface NetworkErrorProps {
  error?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
  context?: string;
}

const NetworkError: React.FC<NetworkErrorProps> = ({
  error = 'Network error - cannot connect to backend',
  onRetry,
  showRetryButton = true,
  context = 'loading data',
}) => {
  const isOnline = useNetworkStatus();
  const [isRetrying, setIsRetrying] = React.useState(false);
  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const isNetworkError = error.toLowerCase().includes('network')
    || error.toLowerCase().includes('connect')
    || !isOnline;

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          {isNetworkError
            ? (
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  {isOnline
                    ? (
                        <Wifi className="w-8 h-8 text-orange-600" />
                      )
                    : (
                        <WifiOff className="w-8 h-8 text-red-600" />
                      )}
                </div>
              )
            : (
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isNetworkError ? 'Connection Problem' : 'Something went wrong'}
        </h3>

        <p className="text-gray-600 mb-6">
          {isNetworkError
            ? (
                isOnline
                  ? (
                      `Unable to connect to the server while ${context}. This might be a temporary issue.`
                    )
                  : (
                      'You appear to be offline. Please check your internet connection.'
                    )
              )
            : (
                error
              )}
        </p>

        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <WifiOff className="w-4 h-4 inline mr-2" />
              You&apos;re currently offline. Some features may not be available.
            </p>
          </div>
        )}

        {showRetryButton && (
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying || !isOnline}
              className={[
                'inline-flex',
                'items-center',
                'px-4',
                'py-2',
                'bg-primary',
                'text-white',
                'rounded-lg',
                'hover:bg-primary/90',
                'disabled:opacity-50',
                'disabled:cursor-not-allowed',
                'transition-colors',
              ].join(' ')}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>

            {!isOnline && (
              <p className="text-xs text-gray-500">
                You&apos;re currently offline. Please check your internet connection and try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkError;
