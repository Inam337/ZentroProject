'use client';

import React, { useState, useEffect } from 'react';

import { applyDiffHighlightingToHtml } from '@/utils/text-diff-highlight';
import CKEditorContentDisplay from '@/components/ui/ckeditor-content-display';

interface DecisionDiffViewerProps {
  original: string;
  modified: string;
  showDiff: boolean;
}

/**
 * Component to display differences between two HTML content strings
 * Shows modified content with proper HTML formatting and word-level highlighting for changed words
 */
export default function DecisionDiffViewer({
  original,
  modified,
  showDiff,
}: DecisionDiffViewerProps) {
  const [highlightedContent, setHighlightedContent] = useState<string>(modified);

  useEffect(() => {
    if (showDiff && modified) {
      // Apply diff highlighting to the HTML content while preserving formatting
      const highlighted = applyDiffHighlightingToHtml(original, modified);

      setHighlightedContent(highlighted);
    } else {
      setHighlightedContent(modified);
    }
  }, [original, modified, showDiff]);

  // Always display with proper HTML formatting
  return (
    <div className="decision-diff-viewer">
      <CKEditorContentDisplay content={highlightedContent} />
    </div>
  );
}
