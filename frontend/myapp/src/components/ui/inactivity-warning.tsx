'use client';

import React, { useState, useEffect } from 'react';

interface InactivityWarningProps {
  isVisible: boolean;
  onExtend: () => void;
  onLogout: () => void;
  timeRemaining: number; // Time remaining in seconds
}
import { CommonIcon } from '@/components/icons';
import { CommonIconNames, IconColors } from '@/components/icons/types';

export function InactivityWarning({
  isVisible,
  onExtend,
  onLogout,
  timeRemaining,
}: InactivityWarningProps) {
  const [countdown, setCountdown] = useState(timeRemaining);
  const logoutButtonClass
    = 'px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md '
      + 'hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500';
  const extendButtonClass
    = 'px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md '
      + 'hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500';

  // Reset countdown when timeRemaining changes
  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onLogout();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, countdown, onLogout]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <CommonIcon
              width={24}
              height={24}
              name={CommonIconNames.WARNING_ICON}
              fill={IconColors.WARNING_COLOR_ICON}
            />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Session Timeout Warning
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            You have been inactive for a while. Your session will expire in
            {' '}
            <span className="font-semibold text-red-600">{countdown}</span>
            {' '}
            seconds.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onLogout}
            className={logoutButtonClass}
          >
            Logout Now
          </button>
          <button
            onClick={onExtend}
            className={extendButtonClass}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
