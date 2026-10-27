import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

import { AppConstants } from '@/common/AppConstants';
import { adminInputClass } from '@/components/admin/admin-form-styles';
import LowStockChart from '@/components/admin/LowStockChart';
import CommercePageState from '@/components/commerce/CommercePageState';
import StatusBadge from '@/components/commerce/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import PageShell from '@/components/ui/PageShell';
import TintedCard from '@/components/ui/TintedCard';
import { useT } from '@/hooks/use-t';
import { downloadCsv } from '@/libs/csv';
import { formatMoney } from '@/libs/format-money';
import { cn } from '@/libs/utils';
import type { StockSummaryRow } from '@/models';
import { getStockSummary } from '@/services/inventory';

type Filter = 'all' | 'out' | 'low';

const shortfall = (r: StockSummaryRow): number => Math.max(0, r.reorderLevel - r.totalQuantity);

function Stat({ label, value, hint, accent }: {
  label: string;
  value: string;
  hint?: string;
  accent: 'rose' | 'amber' | 'sand' | 'mint';
}) {
  return (
    <TintedCard accent={accent}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#1A312C]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-600">{hint}</p> : null}
    </TintedCard>
  );
}

export default function AdminStockAlertsPage() {
  const { t } = useT();
  const [rows, setRows] = useState<StockSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getStockSummary();

    if (result.ok) {
      setRows(result.data);
    } else {
      setError(result.error.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const alerts = useMemo(() => rows.filter(r => r.status !== 'ok'), [rows]);
  const out = alerts.filter(r => r.status === 'out');
  const low = alerts.filter(r => r.status === 'low');
  const unitsShort = alerts.reduce((n, r) => n + shortfall(r), 0);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    return alerts.filter((r) => {
      if (filter !== 'all' && r.status !== filter) {
        return false;
      }

      return !q || r.name.toLowerCase().includes(q) || (r.sku ?? '').toLowerCase().includes(q);
    });
  }, [alerts, filter, search]);

  const columns = useMemo<ColumnDef<StockSummaryRow>[]>(() => [
    {
      accessorKey: 'name',
      header: t('admin.product', 'Product'),
      enableSorting: true,
      cell: ({ row }) => (
        <Link
          to={AppConstants.RouteBuilders.product(row.original.productId)}
          className="font-medium text-[#1A312C] hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      enableSorting: true,
      cell: ({ row }) => row.original.sku ?? '—',
    },
    {
      accessorKey: 'totalQuantity',
      header: t('admin.inventory.onHand', 'On hand'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className={row.original.status === 'out' ? 'font-semibold text-red-700' : 'font-semibold'}>
          {`${row.original.totalQuantity} ${row.original.unit}`}
        </span>
      ),
    },
    {
      accessorKey: 'reorderLevel',
      header: t('admin.inventory.reorderLevel', 'Reorder level'),
      enableSorting: true,
    },
    {
      id: 'shortfall',
      accessorFn: shortfall,
      header: t('admin.alerts.shortfall', 'Needed to reach reorder'),
      enableSorting: true,
      cell: ({ row }) => <span className="font-semibold">{shortfall(row.original)}</span>,
    },
    {
      id: 'restockCost',
      accessorFn: row => shortfall(row) * row.price,
      header: t('admin.alerts.value', 'Value at sale price'),
      enableSorting: true,
      cell: ({ row }) => formatMoney(shortfall(row.original) * row.original.price),
    },
    {
      accessorKey: 'status',
      header: t('admin.status', 'Status'),
      enableSorting: true,
      cell: ({ row }) => row.original.status === 'out'
        ? <StatusBadge label={t('admin.inventory.out', 'Out')} tone="danger" />
        : <StatusBadge label={t('admin.inventory.low', 'Low')} tone="warning" />,
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex justify-end gap-4 whitespace-nowrap text-sm font-medium">
          <Link
            to={AppConstants.Routes.Private.Admin.Purchases}
            className="text-[#428475] hover:underline"
          >
            {t('admin.dashboard.restock', 'Restock')}
          </Link>
          <Link
            to={AppConstants.Routes.Private.Admin.Inventory}
            className="text-gray-700 hover:underline"
          >
            {t('admin.inventory.details', 'Details')}
          </Link>
        </div>
      ),
    },
  ], [t]);

  const exportCsv = () => {
    downloadCsv(
      `stock-alerts-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Product', 'SKU', 'Unit', 'On hand', 'Reorder level', 'Needed', 'Status'],
      visible.map(r => [r.name, r.sku, r.unit, r.totalQuantity, r.reorderLevel, shortfall(r), r.status]),
    );
  };

  const chip = (active: boolean) => cn(
    'rounded-full border px-3 py-1 text-sm transition-colors',
    active ? 'border-[#428475] bg-[#428475] text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  );

  return (
    <CommercePageState
      loading={loading}
      error={error}
      onRetry={load}
    >
      <PageShell
        maxWidth="full"
        hint={t('admin.alerts.hint', 'Everything at or below its reorder level, worst first.')}
      >
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label={t('admin.inventory.out', 'Out')}
            value={String(out.length)}
            hint={t('admin.alerts.outHint', 'Cannot be sold right now')}
            accent={out.length > 0 ? 'rose' : 'mint'}
          />
          <Stat
            label={t('admin.inventory.low', 'Low')}
            value={String(low.length)}
            hint={t('admin.alerts.lowHint', 'At or below reorder level')}
            accent={low.length > 0 ? 'amber' : 'mint'}
          />
          <Stat
            label={t('admin.alerts.unitsShort', 'Units needed')}
            value={String(unitsShort)}
            hint={t('admin.alerts.unitsShortHint', 'To bring every product back to its reorder level')}
            accent="sand"
          />
          <Stat
            label={t('admin.alerts.healthy', 'Healthy products')}
            value={`${rows.length - alerts.length} / ${rows.length}`}
            accent="mint"
          />
        </div>

        <div className="mb-4">
          <LowStockChart
            items={alerts}
            limit={Number.POSITIVE_INFINITY}
            hideLink
          />
        </div>

        <div className="mb-3 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200/80 bg-white/70 p-3">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={t('admin.status', 'Status')}
          >
            <button type="button" aria-pressed={filter === 'all'} className={chip(filter === 'all')} onClick={() => setFilter('all')}>
              {`${t('filters.all', 'All')} (${alerts.length})`}
            </button>
            <button type="button" aria-pressed={filter === 'out'} className={chip(filter === 'out')} onClick={() => setFilter('out')}>
              {`${t('admin.inventory.out', 'Out')} (${out.length})`}
            </button>
            <button type="button" aria-pressed={filter === 'low'} className={chip(filter === 'low')} onClick={() => setFilter('low')}>
              {`${t('admin.inventory.low', 'Low')} (${low.length})`}
            </button>
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="sr-only" htmlFor="alerts-search">{t('common.search', 'Search')}</label>
            <input
              id="alerts-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.alerts.search', 'Search product or SKU…')}
              className={adminInputClass}
            />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={visible.length === 0}
            className="h-10 rounded-md bg-[#428475] px-4 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-40"
          >
            {t('admin.inventory.exportCsv', 'Export CSV')}
          </button>
        </div>

        <DataTable
          columns={columns}
          data={visible}
          showPagination
          itemsPerPage={10}
          emptyMessage={alerts.length === 0
            ? t('admin.dashboard.allGood', 'All products are above their reorder level.')
            : t('admin.inventory.noMatch', 'No products match your filters.')}
        />
      </PageShell>
    </CommercePageState>
  );
}
