import React from 'react';

import { cn } from '@/libs/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text = 'Loading...',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="relative">
          {/* Outer ring */}
          <div
            className={cn(
              'animate-spin rounded-full border-4 border-gray-200 border-t-green-600',
              sizeClasses[size],
              className,
            )}
            role="status"
            aria-label="Loading"
          />
          {/* Inner pulse */}
          <div
            className={cn(
              'absolute inset-0 rounded-full bg-green-600/20 animate-pulse',
              sizeClasses[size],
            )}
          />
          {/* Center dot */}
          <div
            className={cn(
              'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-600',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4',
            )}
          />
        </div>
        <p
          className="text-gray-600 text-sm font-medium mt-4 animate-pulse"
          aria-live="polite"
        >
          {text}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
