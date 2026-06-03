'use client';

import { ErrorInfo, ReactNode, memo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommonIcon } from '@/components/icons/common-icons';
import { CommonIconNames, IconColors } from '@/components/icons/types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Function-based error boundary component
function EnhancedErrorBoundary({ children, fallback, onError }: Props) {
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });
  const intl = useIntl();

  // Handle errors using useEffect and error event listeners
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('ErrorBoundary caught an error:', error);

      const errorInfo: ErrorInfo = {
        componentStack: error.error?.stack || '',
      };

      setErrorState({
        hasError: true,
        error: error.error || new Error(error.message),
        errorInfo,
      });

      // Call custom error handler if provided
      if (onError) {
        onError(error.error || new Error(error.message), errorInfo);
      }

      // Log to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        console.error('Production error:', { error: error.error, errorInfo });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('ErrorBoundary caught an unhandled rejection:', event);

      const errorInfo: ErrorInfo = {
        componentStack: event.reason?.stack || '',
      };

      setErrorState({
        hasError: true,
        error: event.reason || new Error('Unhandled Promise Rejection'),
        errorInfo,
      });
    };

    // Add global error listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  const handleRetry = () => {
    setErrorState({ hasError: false });
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (errorState.hasError) {
    // Custom fallback UI if provided
    if (fallback) {
      return fallback;
    }

    const WRONG_THING_ICON_SIZE = 32;

    // Default error UI with accessibility features
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <div className="mx-auto mb-4 w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                <CommonIcon
                  name={CommonIconNames.WRONG_THING_ICON}
                  width={WRONG_THING_ICON_SIZE}
                  height={WRONG_THING_ICON_SIZE}
                  fill={IconColors.GRAY_COLOR_ICON}
                />
              </div>
            </div>
            <CardTitle className="text-black">
              {intl.formatMessage({
                id: 'systems.errors.messages.title.someThingWrongHeading',
                defaultMessage: 'Oops! something went wrong',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 text-sm">

              {intl.formatMessage({
                id: 'systems.errors.messages.body.someThingWrongBody',
                defaultMessage: 'We encountered an unexpected error. Please try again or reload the page.',
              })}

            </p>
            {process.env.NODE_ENV === 'development' && errorState.error && (
              <details className="text-left bg-gray-50 p-3 rounded border">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
                  {errorState.error.message}
                  {'\n\n'}
                  {errorState.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CommonIcon
                  name={CommonIconNames.COG_ICON}
                  width={16}
                  height={16}
                  fill={IconColors.GRAY_COLOR_ICON}
                />
                {intl.formatMessage({
                  id: 'systems.errors.messages.actions.tryAgain',
                  defaultMessage: 'Try Again',
                })}
              </Button>

              <Button
                onClick={handleReload}
                className="flex items-center gap-2"
              >
                <CommonIcon
                  name={CommonIconNames.DOWNLOAD_ICON}
                  width={16}
                  height={16}
                  fill={IconColors.WHITE_COLOR_ICON}
                />
                {intl.formatMessage({
                  id: 'systems.errors.messages.actions.reLoadPage',
                  defaultMessage: 'Reload Page',
                })}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Functional wrapper component that can use hooks
function ErrorBoundaryWrapper(props: Omit<Props, 'messages'>) {
  return (
    <EnhancedErrorBoundary
      {...props}
    />
  );
}

// Memoized wrapper component for performance
const MemoizedErrorBoundary = memo(ErrorBoundaryWrapper);

MemoizedErrorBoundary.displayName = 'EnhancedErrorBoundary';

export default MemoizedErrorBoundary;
