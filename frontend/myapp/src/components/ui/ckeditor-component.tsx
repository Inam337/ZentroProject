'use client';

import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading,
  Font,
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
  Alignment,
  Indent,
  IndentBlock,
  List,
  TodoList,
  Link,
  AutoLink,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  SpecialCharacters,
  SpecialCharactersEssentials,
  PageBreak,
  SelectAll,
  FindAndReplace,
  WordCount,
  TextTransformation,
  PasteFromOffice,
  GeneralHtmlSupport,
  Code,
} from 'ckeditor5';

import { CommonIconNames } from '@/components/icons/types';
import { CommonIcon } from '@/components/icons';
import { cn } from '@/libs/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CKEditorContentDisplay } from '@/components/ui/ckeditor-content-display';
import {
  downloadHtmlAsPDF,
  getWordPreviewHtml,
  ComplaintDataForPDF,
} from '@/utils/export-content';
import 'ckeditor5/ckeditor5.css';
import { LoadingButton } from '@/components/ui/loading-button';

const ICON_SIZE = 16;
// Custom styles for lists, paragraphs, and headings
const editorStyles = `
  /* Paragraph styles */
  .ck-editor__editable p {
    margin: 8px 0;
    line-height: 1.5;
    font-size: 14px;
    color: #333;
  }
  
  /* Heading styles */
  .ck-editor__editable h1 {
    font-size: 32px;
    font-weight: bold;
    margin: 20px 0 16px 0;
    color: #1a1a1a;
    line-height: 1.2;
  }
  
  .ck-editor__editable h2 {
    font-size: 28px;
    font-weight: bold;
    margin: 18px 0 14px 0;
    color: #1a1a1a;
    line-height: 1.3;
  }
  
  .ck-editor__editable h3 {
    font-size: 24px;
    font-weight: bold;
    margin: 16px 0 12px 0;
    color: #1a1a1a;
    line-height: 1.3;
  }
  
  .ck-editor__editable h4 {
    font-size: 20px;
    font-weight: bold;
    margin: 14px 0 10px 0;
    color: #1a1a1a;
    line-height: 1.4;
  }
  
  .ck-editor__editable h5 {
    font-size: 18px;
    font-weight: bold;
    margin: 12px 0 8px 0;
    color: #1a1a1a;
    line-height: 1.4;
  }
  
  .ck-editor__editable h6 {
    font-size: 16px;
    font-weight: bold;
    margin: 10px 0 6px 0;
    color: #1a1a1a;
    line-height: 1.4;
  }
  
  /* List styles */
  .ck-editor__editable ul {
    list-style-type: disc;
    margin: 8px 0;
    padding-left: 24px;
  }
  
  .ck-editor__editable ol {
    list-style-type: decimal;
    margin: 8px 0;
    padding-left: 24px;
  }
  
  .ck-editor__editable li {
    margin: 2px 0;
    padding-left: 4px;
    line-height: 1.6;
  }
  
  .ck-editor__editable ul ul {
    list-style-type: circle;
    margin: 4px 0;
  }
  
  .ck-editor__editable ul ul ul {
    list-style-type: square;
    margin: 4px 0;
  }
  
  .ck-editor__editable ol ol {
    list-style-type: lower-alpha;
    margin: 4px 0;
  }
  
  .ck-editor__editable ol ol ol {
    list-style-type: lower-roman;
    margin: 4px 0;
  }
  
  /* Blockquote styles */
  .ck-editor__editable blockquote {
    margin: 16px 0;
    padding: 12px 16px;
    border-left: 4px solid #007cba;
    background-color: #f8f9fa;
    font-style: italic;
    color: #555;
  }
  
  /* Code styles */
  .ck-editor__editable code {
    background-color: #f1f1f1;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #d63384;
  }
`;

interface CKEditorComponentProps {
  value?: string;
  onChange?: (data: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  initialData?: string;
  licenseKey?: string;
  showExportButtons?: boolean;
  complaintData?: ComplaintDataForPDF;
  /** PDF/Word preview title; official signature block only when this is `DECISION` (final decision). */
  exportDocumentTitle?: string;
}

export function CKEditorComponent({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  initialData = '<p>Start typing...</p>',
  licenseKey = 'GPL',
  showExportButtons = true,
  complaintData,
  exportDocumentTitle = 'DOCUMENT',
}: CKEditorComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wordPreviewHtml, setWordPreviewHtml] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  // Check if there's meaningful content in the editor
  const hasContent = () => {
    const content = value || initialData;
    // Remove HTML tags and check if there's actual text content
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    // Check if content is not just placeholder text
    const isPlaceholder = textContent === '' || textContent === 'Start typing...' || textContent === 'Start typing';

    return !isPlaceholder && textContent.length > 0;
  };

  const handleChange = (event: unknown, editor: { getData: () => string }) => {
    const data = editor.getData();

    onChange?.(data);
  };

  const handleViewDocument = async () => {
    setIsModalOpen(true);
    setIsLoadingPreview(true);

    try {
      const content = value || initialData;
      const html = await getWordPreviewHtml(content, complaintData, 'A4', exportDocumentTitle);

      setWordPreviewHtml(html);
    } catch (error) {
      // Fallback to empty preview
      setWordPreviewHtml('');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownloadPDF = () => {
    const content = value || initialData;

    downloadHtmlAsPDF(content, 'document', complaintData, 'A4', exportDocumentTitle);
  };

  return (
    <div className={cn('ckeditor-container', className)}>
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      <CKEditor
        editor={ClassicEditor}
        data={value || initialData}
        onChange={handleChange}
        disabled={disabled}
        config={{
          licenseKey,
          ui: {
            poweredBy: {
              side: null,
            },
          },
          plugins: [
            // Essentials
            Essentials,
            Paragraph,

            // Text Formatting
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Code,

            // Headings
            Heading,

            // Font Features
            Font,
            FontSize,
            FontFamily,
            FontColor,
            FontBackgroundColor,

            // Alignment & Indentation
            Alignment,
            Indent,
            IndentBlock,

            // Lists
            List,
            TodoList,

            // Links
            Link,
            AutoLink,

            // Tables
            Table,
            TableToolbar,
            TableProperties,
            TableCellProperties,

            // Special Characters
            SpecialCharacters,
            SpecialCharactersEssentials,

            // Page Features
            PageBreak,

            // Utilities
            SelectAll,
            FindAndReplace,
            WordCount,
            TextTransformation,
            PasteFromOffice,
            GeneralHtmlSupport,
          ],
          toolbar: {
            items: [
              'undo', 'redo',
              '|',
              'heading',
              '|',
              'bold', 'italic', 'underline', 'strikethrough',
              '|',
              'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
              '|',
              'alignment',
              '|',
              'bulletedList', 'numberedList', 'todoList',
              '|',
              'outdent', 'indent',
              '|',
              'link', 'blockQuote', 'insertTable',
              '|',
              'pageBreak',
              '|',
              'specialCharacters',
              '|',
              'findAndReplace', 'selectAll',
              '|',
              'subscript', 'superscript', 'code',
              '|',
              'removeFormat',
            ],
            shouldNotGroupWhenFull: true,
          },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: { name: 'h1' }, title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: { name: 'h2' }, title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: { name: 'h3' }, title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: { name: 'h4' }, title: 'Heading 4', class: 'ck-heading_heading4' },
              { model: 'heading5', view: { name: 'h5' }, title: 'Heading 5', class: 'ck-heading_heading5' },
              { model: 'heading6', view: { name: 'h6' }, title: 'Heading 6', class: 'ck-heading_heading6' },
            ],
          },
          htmlSupport: {
            allow: [
              {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true,
              },
            ],
          },
          list: {
            properties: {
              styles: true,
              startIndex: true,
              reversed: true,
            },
          },
          fontFamily: {
            options: [
              'default',
              'Arial, Helvetica, sans-serif',
              'Courier New, Courier, monospace',
              'Georgia, serif',
              'Lucida Sans Unicode, Lucida Grande, sans-serif',
              'Tahoma, Geneva, sans-serif',
              'Times New Roman, Times, serif',
              'Trebuchet MS, Helvetica, sans-serif',
              'Verdana, Geneva, sans-serif',
            ],
            supportAllValues: true,
          },
          fontSize: {
            options: [9, 11, 13, 'default', 17, 20],
            supportAllValues: true,
          },
          fontColor: {
            colors: [
              { color: 'hsl(0, 0%, 0%)', label: 'Black' },
              { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
              { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
              { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
              { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
              { color: 'hsl(0, 75%, 60%)', label: 'Red' },
              { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
              { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
              { color: 'hsl(90, 75%, 60%)', label: 'Light green' },
              { color: 'hsl(120, 75%, 60%)', label: 'Green' },
              { color: 'hsl(150, 75%, 60%)', label: 'Aquamarine' },
              { color: 'hsl(180, 75%, 60%)', label: 'Turquoise' },
              { color: 'hsl(210, 75%, 60%)', label: 'Light blue' },
              { color: 'hsl(240, 75%, 60%)', label: 'Blue' },
              { color: 'hsl(270, 75%, 60%)', label: 'Purple' },
            ],
          },
          fontBackgroundColor: {
            colors: [
              { color: 'hsl(0, 0%, 0%)', label: 'Black' },
              { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
              { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
              { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
              { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
              { color: 'hsl(0, 75%, 60%)', label: 'Red' },
              { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
              { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
              { color: 'hsl(90, 75%, 60%)', label: 'Light green' },
              { color: 'hsl(120, 75%, 60%)', label: 'Green' },
              { color: 'hsl(150, 75%, 60%)', label: 'Aquamarine' },
              { color: 'hsl(180, 75%, 60%)', label: 'Turquoise' },
              { color: 'hsl(210, 75%, 60%)', label: 'Light blue' },
              { color: 'hsl(240, 75%, 60%)', label: 'Blue' },
              { color: 'hsl(270, 75%, 60%)', label: 'Purple' },
            ],
          },
          table: {
            contentToolbar: [
              'tableColumn',
              'tableRow',
              'mergeTableCells',
              'tableProperties',
              'tableCellProperties',
            ],
          },
          link: {
            decorators: {
              openInNewTab: {
                mode: 'manual',
                label: 'Open in a new tab',
                attributes: {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
              },
            },
          },
          placeholder,
        }}
      />
      {showExportButtons && (
        <div className="mt-4 flex gap-2 justify-end">
          <LoadingButton
            onClick={handleViewDocument}
            disabled={!hasContent()}
            className="h-8 px-4 bg-white border border-gray-700 text-gray-700 rounded hover:bg-gray-100
            transition-colors flex items-center hover:text-primary-600 gap-1 justify-center text-xs cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            type="button"

          >
            <CommonIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              name={CommonIconNames.VIEW_ICON}
            />
            Document Preview
          </LoadingButton>
          {/* <button
            onClick={exportToPDF}
            className="h-8 px-4 bg-white border border-red-700 text-red-700 rounded hover:bg-red-100
            transition-colors flex items-center gap-1 justify-center text-xs cursor-pointer"
            type="button"
          >
            <CommonIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              name={CommonIconNames.PDF_DOCUMENT_ICON}
            />
            PDF
          </button>
          <button
            onClick={exportToWord}
            className="h-8 px-4 bg-white border border-blue-700 text-blue-700 rounded hover:bg-blue-100
            transition-colors flex items-center gap-1 justify-center text-xs cursor-pointer"
            type="button"
          >
            <CommonIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              name={CommonIconNames.WORD_DOCUMENT_ICON}
            />
            WORD
          </button> */}
        </div>
      )}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <DialogContent
          className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 flex flex-col m-0 rounded-none
          translate-x-0 translate-y-0 left-0 top-0"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0 rounded-none">
            <div className="flex items-center justify-between">
              <DialogTitle>Document Preview</DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6 py-4 bg-gray-50">
            {isLoadingPreview
              ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading preview...</div>
                  </div>
                )
              : wordPreviewHtml
                ? (
                    <iframe
                      srcDoc={wordPreviewHtml}
                      className="w-full h-full min-h-[550px] border border-gray-300 bg-white rounded overflow-auto"
                      title="Word Document Preview"
                      sandbox="allow-same-origin"
                    />
                  )
                : (
                    <div className="overflow-auto h-full">
                      <CKEditorContentDisplay
                        content={value || initialData}
                        className="max-w-4xl mx-auto"
                      />
                    </div>
                  )}
          </div>
          <div className="px-6 py-4 border-t flex-shrink-0 flex justify-end">
            <button
              onClick={handleDownloadPDF}
              className="h-9 px-4 bg-white border border-red-700 text-red-700 rounded hover:bg-red-100
              transition-colors flex items-center gap-2 justify-center text-sm cursor-pointer"
              type="button"
            >
              <CommonIcon
                width={ICON_SIZE}
                height={ICON_SIZE}
                name={CommonIconNames.PDF_DOCUMENT_ICON}
              />
              Download PDF
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
