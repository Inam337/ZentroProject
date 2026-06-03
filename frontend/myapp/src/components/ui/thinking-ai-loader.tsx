'use client';

import React from 'react';
import { useIntl } from 'react-intl';

import { cn } from '@/libs/utils';
import { AppConstants } from '@/common/app-constants';

interface ThinkingAILoaderProps {
  generatingMessage?: string;
  analyzingMessage?: string;
  className?: string;
}

export function ThinkingAILoader({
  generatingMessage,
  analyzingMessage,
  className,
}: ThinkingAILoaderProps) {
  const intl = useIntl();
  const { AILoader } = AppConstants.Colors;
  const defaultGeneratingMessage = intl.formatMessage({
    id: 'complaints.aiResults.thinking',
    defaultMessage: 'Thinking...',
  });
  const defaultAnalyzingMessage = intl.formatMessage({
    id: 'complaints.aiResults.analyzing',
    defaultMessage: 'Analyzing complaint details and generating insights...',
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes ai-dot-1 {
              0%, 20% { opacity: 0; }
              40% { opacity: 1; }
              100% { opacity: 0; }
            }
            @keyframes ai-dot-2 {
              0%, 20% { opacity: 0; }
              40% { opacity: 1; }
              100% { opacity: 0; }
            }
            @keyframes ai-dot-3 {
              0%, 20% { opacity: 0; }
              40% { opacity: 1; }
              100% { opacity: 0; }
            }
            @keyframes ai-progress {
              0% { width: 0%; transform: translateX(0); }
              50% { width: 70%; transform: translateX(0); }
              100% { width: 100%; transform: translateX(100%); }
            }
            .ai-dot-1 {
              animation: ai-dot-1 1.5s infinite;
            }
            .ai-dot-2 {
              animation: ai-dot-2 1.5s infinite 0.2s;
            }
            .ai-dot-3 {
              animation: ai-dot-3 1.5s infinite 0.4s;
            }
            .ai-progress-bar {
              animation: ai-progress 2s ease-in-out infinite;
            }
          `,
        }}
      />
      <div className={cn('flex items-center justify-center py-12 h-full', className)}>
        <div className="text-center relative">
          {/* Animated AI Brain/Neural Network Visualization */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Outer rotating ring */}
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
              style={{
                animationDuration: AILoader.animationDurations.outerRing,
                borderTopColor: AILoader.coral,
                borderRightColor: AILoader.teal,
              }}
            />
            {/* Middle pulsing ring */}
            <div
              className="absolute inset-4 rounded-full border-4 border-transparent animate-spin"
              style={{
                animationDuration: AILoader.animationDurations.middleRing,
                animationDirection: 'reverse',
                borderBottomColor: AILoader.blue,
                borderLeftColor: AILoader.green,
              }}
            />
            {/* Inner core with gradient pulse */}
            <div
              className="absolute inset-8 rounded-full animate-pulse"
              style={{
                animationDuration: AILoader.animationDurations.innerCore,
                background: AILoader.gradientRadial,
              }}
            />
            {/* Floating particles */}
            <div
              className="absolute top-0 left-1/2 w-2 h-2 rounded-full animate-ping"
              style={{
                animationDelay: AILoader.particleDelays.first,
                animationDuration: AILoader.animationDurations.particles,
                backgroundColor: AILoader.coral,
              }}
            />
            <div
              className="absolute top-1/4 right-0 w-2 h-2 rounded-full animate-ping"
              style={{
                animationDelay: AILoader.particleDelays.second,
                animationDuration: AILoader.animationDurations.particles,
                backgroundColor: AILoader.teal,
              }}
            />
            <div
              className="absolute bottom-0 left-1/4 w-2 h-2 rounded-full animate-ping"
              style={{
                animationDelay: AILoader.particleDelays.third,
                animationDuration: AILoader.animationDurations.particles,
                backgroundColor: AILoader.blue,
              }}
            />
            <div
              className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full animate-ping"
              style={{
                animationDelay: AILoader.particleDelays.fourth,
                animationDuration: AILoader.animationDurations.particles,
                backgroundColor: AILoader.green,
              }}
            />
          </div>

          {/* Animated text with thinking dots */}
          <div className="space-y-2">
            <p
              className="text-lg font-semibold bg-clip-text text-transparent"
              style={{
                backgroundImage: AILoader.gradient,
              }}
            >
              {generatingMessage || defaultGeneratingMessage}
              <span className="inline-block">
                <span className="ai-dot-1">.</span>
                <span className="ai-dot-2">.</span>
                <span className="ai-dot-3">.</span>
              </span>
            </p>
            <p className="text-sm text-gray-500 animate-pulse">
              {analyzingMessage || defaultAnalyzingMessage}
            </p>
          </div>

          {/* Progress bar animation */}
          <div className="mt-6 w-64 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full ai-progress-bar"
              style={{
                background: AILoader.gradient,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
