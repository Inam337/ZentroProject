import { Link } from 'react-router-dom';

import { AppConstants } from '@/common/AppConstants';
import { chartColors } from '@/components/admin/charts';
import TintedCard from '@/components/ui/TintedCard';
import { useT } from '@/hooks/use-t';
import type { StockSummaryRow } from '@/models';

/**
 * Horizontal bar chart of products at or below their reorder level.
 * Each bar is on-hand stock as a share of the reorder level (full bar = at the
 * reorder level), worst first.
 */
export default function LowStockChart({
  items,
  limit = 10,
  hideLink = false,
}: {
  items: StockSummaryRow[];
  /** Max rows to draw (worst first). */
  limit?: number;
  /** Hide the link to the full Stock alerts page (when already on it). */
  hideLink?: boolean;
}) {
  const { t } = useT();

  if (items.length === 0) {
    return (
      <TintedCard accent="mint">
        <p className="font-semibold text-[#1A312C]">
          {t('admin.dashboard.allGoodTitle', 'Stock levels look healthy')}
        </p>
        <p className="text-sm text-gray-600">
          {t('admin.dashboard.allGood', 'All products are above their reorder level.')}
        </p>
      </TintedCard>
    );
  }

  const rows = [...items]
    .sort((a, b) => a.totalQuantity / Math.max(1, a.reorderLevel) - b.totalQuantity / Math.max(1, b.reorderLevel))
    .slice(0, limit);

  return (
    <TintedCard accent="amber">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-base font-semibold text-[#1A312C]">
          {t('admin.dashboard.nearOut', 'Near out of stock')}
          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            {items.length}
          </span>
        </h4>
        <div className="flex items-center gap-4 text-xs text-gray-700">
          <span className="flex items-center gap-1">
            <i className="inline-block size-2.5 rounded-sm" style={{ background: chartColors.amber }} />
            {t('admin.inventory.low', 'Low')}
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block size-2.5 rounded-sm" style={{ background: chartColors.red }} />
            {t('admin.inventory.out', 'Out')}
          </span>
        </div>
      </div>

      <ul
        className="space-y-3"
        aria-label={t('admin.dashboard.nearOutChart', 'Stock on hand compared with reorder level')}
      >
        {rows.map((r) => {
          const out = r.status === 'out';
          const pct = Math.min(100, Math.round((r.totalQuantity / Math.max(1, r.reorderLevel)) * 100));

          return (
            <li
              key={r.productId}
              className="grid grid-cols-[minmax(110px,200px)_1fr_auto] items-center gap-3 text-sm"
            >
              <span className="truncate font-medium text-[#1A312C]" title={r.name}>{r.name}</span>
              <div
                className="relative h-4 overflow-hidden rounded-full bg-white/80 ring-1 ring-black/5"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${r.name}: ${r.totalQuantity} of ${r.reorderLevel}`}
              >
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{
                    width: `${pct}%`,
                    background: out ? chartColors.red : chartColors.amber,
                    minWidth: out ? 0 : 6,
                  }}
                />
              </div>
              <span className="flex w-[170px] items-center justify-end gap-3">
                <span className={out ? 'font-semibold text-red-700' : 'font-semibold text-[#1A312C]'}>
                  {`${r.totalQuantity} / ${r.reorderLevel}`}
                  <span className="ml-1 text-xs font-normal text-gray-600">{r.unit}</span>
                </span>
                <Link
                  to={AppConstants.Routes.Private.Admin.Purchases}
                  className="text-xs font-medium text-[#428475] hover:underline"
                >
                  {t('admin.dashboard.restock', 'Restock')}
                </Link>
              </span>
            </li>
          );
        })}
      </ul>

      {items.length > rows.length
        ? (
            <p className="mt-3 text-xs font-medium text-gray-700">
              {t('admin.dashboard.moreHidden', 'Showing the {n} lowest of {total}.', { n: rows.length, total: items.length })}
            </p>
          )
        : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-3">
        <p className="min-w-0 flex-1 text-xs text-gray-600">
          {t('admin.dashboard.nearOutNote', 'A full bar means stock is at its reorder level. Shorter bars are closer to empty.')}
        </p>
        {hideLink
          ? null
          : (
              <Link
                to={AppConstants.Routes.Private.Admin.StockAlerts}
                className={[
                  'ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-[#428475] px-4 py-1.5',
                  'text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1A312C]',
                ].join(' ')}
              >
                {t('admin.dashboard.viewDetails', 'View full details →')}
              </Link>
            )}
      </div>
    </TintedCard>
  );
}
