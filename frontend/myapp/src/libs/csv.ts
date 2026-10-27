function escapeCell(value: unknown): string {
  const text = value == null ? '' : String(value);

  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Download rows as a CSV file (client-side, no server round trip). */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
): void {
  const body = [headers, ...rows]
    .map(row => row.map(escapeCell).join(','))
    .join('\r\n');
  // BOM so Excel opens UTF-8 (e.g. Urdu product names) correctly.
  const blob = new Blob([`﻿${body}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
