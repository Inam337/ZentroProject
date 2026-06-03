'use client';

import React from 'react';

import { cn } from '@/libs/utils';
import { sanitizeHtml } from '@/utils/sanitize';
import '@/styles/ckeditor-content.css';

interface CKEditorContentDisplayProps {
  content?: string;
  className?: string;
  fallbackMessage?: string;
}

export function CKEditorContentDisplay({
  content,
  className,
  fallbackMessage = 'No content available.',
}: CKEditorContentDisplayProps) {
  if (!content || content.trim() === '') {
    return (
      <div className={cn('text-gray-500 italic text-sm', className)}>
        {fallbackMessage}
      </div>
    );
  }

  // Sanitize content before rendering to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div
      className={cn('ckeditor-content prose max-w-none text-sm text-gray-700 break-words leading-relaxed', className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

export default CKEditorContentDisplay;
