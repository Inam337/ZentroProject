import { formatMoney } from '@/libs/format-money';
import type { Sale } from '@/models';

function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[ch] as string
  ));
}

/** Human-friendly invoice number, e.g. INV-00042. */
export const invoiceNumber = (id: number): string => `INV-${String(id).padStart(5, '0')}`;

/** Opens a print-ready invoice for a sale in a new window. */
export function printSaleInvoice(sale: Sale): void {
  const win = window.open('', '_blank', 'width=800,height=900');

  if (!win) {
    return;
  }

  const rows = (sale.items ?? []).map((item) => {
    const price = Number.parseFloat(String(item.unitPrice));

    return `<tr>
      <td>${esc(item.product?.name ?? `Product #${item.id}`)}</td>
      <td class="n">${esc(item.quantity)}</td>
      <td class="n">${esc(formatMoney(price))}</td>
      <td class="n">${esc(formatMoney(price * item.quantity))}</td>
    </tr>`;
  }).join('');

  win.document.write(`<!doctype html><html><head><meta charset="utf-8">
<title>${esc(invoiceNumber(sale.id))}</title>
<style>
  body{font:14px/1.5 system-ui,sans-serif;color:#1A312C;margin:32px}
  h1{margin:0;color:#428475} .meta{color:#555;margin:4px 0 20px}
  table{width:100%;border-collapse:collapse}
  th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}
  .n{text-align:right} tfoot td{font-weight:700;border-bottom:0}
  @media print{button{display:none}}
</style></head><body>
<h1>Zentro</h1>
<p class="meta">${esc(invoiceNumber(sale.id))}${sale.status === 'cancelled' ? ' · <strong style="color:#C0392B">CANCELLED</strong>' : ''} · ${esc(sale.soldAt ? new Date(sale.soldAt).toLocaleString() : '')}
${sale.customer ? `<br>Customer: ${esc(sale.customer.name)}` : ''}</p>
<table>
  <thead><tr><th>Item</th><th class="n">Qty</th><th class="n">Unit price</th><th class="n">Amount</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr><td colspan="3" class="n">Total</td><td class="n">${esc(formatMoney(sale.totalAmount))}</td></tr></tfoot>
</table>
<p><button onclick="window.print()">Print</button></p>
</body></html>`);
  win.document.close();
  win.focus();
}
