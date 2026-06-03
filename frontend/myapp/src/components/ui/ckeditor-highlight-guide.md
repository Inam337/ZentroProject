# CKEditor 5 Highlight Feature Installation Guide

## Overview
The CKEditor component now includes all free features available in CKEditor 5. To add the highlight feature (text highlighting), follow these steps:

## Installation Steps

### 1. Install the Highlight Package
```bash
npm install @ckeditor/ckeditor5-highlight
```

### 2. Update the CKEditor Component
Add the following to `src/components/ui/ckeditor.tsx`:

#### Import Statement
```typescript
import { Highlight } from '@ckeditor/ckeditor5-highlight/src/highlight';
```

#### Add to Plugins Array
```typescript
plugins: [
  // ... existing plugins
  Highlight,
  // ... rest of plugins
],
```

#### Add to Toolbar
```typescript
toolbar: {
  items: [
    // ... existing items
    'highlight',
    // ... rest of items
  ],
},
```

#### Add Highlight Configuration
```typescript
highlight: {
  options: [
    {
      model: 'yellowMarker',
      class: 'marker-yellow',
      title: 'Yellow Marker',
      color: 'var(--ck-highlight-marker-yellow)',
      type: 'marker',
    },
    {
      model: 'greenMarker',
      class: 'marker-green',
      title: 'Green Marker',
      color: 'var(--ck-highlight-marker-green)',
      type: 'marker',
    },
    {
      model: 'pinkMarker',
      class: 'marker-pink',
      title: 'Pink Marker',
      color: 'var(--ck-highlight-marker-pink)',
      type: 'marker',
    },
    {
      model: 'blueMarker',
      class: 'marker-blue',
      title: 'Blue Marker',
      color: 'var(--ck-highlight-marker-blue)',
      type: 'marker',
    },
  ],
},
```

### 3. Add CSS Import
```typescript
import '@ckeditor/ckeditor5-highlight/theme/highlight.css';
```

## Current Features Available

The CKEditor component now includes all these free features:

- **Text Formatting**: Bold, Italic, Underline, Strikethrough, Code, Subscript, Superscript
- **Headings**: Paragraph, H1-H6
- **Font Features**: Font Family, Font Size, Font Color, Font Background Color
- **Alignment**: Text alignment, Indentation
- **Lists**: Bulleted, Numbered, Todo lists
- **Links**: Link insertion, Auto-link, Open in new tab
- **Tables**: Full table editing with properties
- **Images**: Upload, resize, styles, captions
- **Media**: Embed YouTube, Vimeo, etc.
- **Content**: Block quotes, Horizontal lines, Page breaks
- **Special Characters**: Mathematical symbols, Currency, Arrows
- **Utilities**: Find & Replace, Select All, Word Count, Text Transformation

## Usage
The component is already integrated into:
- `src/components/complaints-management/complaint-details-tabs/decision-findings.tsx`
- Ready to be used in any other component that needs rich text editing

## Notes
- All features are free and don't require a license
- The highlight feature requires the separate package installation
- The component is fully TypeScript compatible
- All linting rules are satisfied
