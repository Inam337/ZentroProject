'use client';

import dynamic from 'next/dynamic';

/**
 * CKEditor 5 Component with Dynamic Import
 *
 * This component uses dynamic imports to prevent SSR issues and dependency errors.
 * The actual CKEditor component is loaded only on the client side.
 */

// Dynamic import wrapper to fix CKEditor dependency issues
const CKEditorComponentDynamic = dynamic(
  () => import('./ckeditor-component').then(mod => ({ default: mod.CKEditorComponent })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-32 border border-gray-200 rounded-md">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    ),
  },
);

export default CKEditorComponentDynamic;
export { CKEditorComponentDynamic as CKEditorComponent };
