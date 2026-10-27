import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import AdminFilterField, { adminFilterSelectClass } from '@/components/admin/AdminFilterField';
import { adminInputClass, adminLabelClass } from '@/components/admin/admin-form-styles';
import { matchesSearchQuery, useAdminTableFilters } from '@/components/admin/useAdminTableFilters';
import CommercePageState from '@/components/commerce/CommercePageState';
import StatusBadge from '@/components/commerce/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import FieldError from '@/components/ui/FieldError';
import FormDrawer from '@/components/ui/FormDrawer';
import PageShell from '@/components/ui/PageShell';
import PageToolbar from '@/components/ui/PageToolbar';
import { useT } from '@/hooks/use-t';
import { downloadCsv } from '@/libs/csv';
import { formatMoney } from '@/libs/format-money';
import { cn } from '@/libs/utils';
import type {
  Paginated,
  StockMovement,
  StockMovementType,
  StockSummaryRow,
} from '@/models';
import { getStockSummary, listStockMovements, writeOffStock } from '@/services/inventory';

type Tab = 'levels' | 'movements';

const MOVEMENT_TYPES: StockMovementType[] = [
  'purchase',
  'purchase_reversal',
  'sale',
  'sale_reversal',
  'order',
  'order_reversal',
  'adjustment',
];

const PAGE_SIZE = 15;

export default function AdminInventoryPage() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>('levels');

  // ----- stock levels (client-side filtering: one row per product) ---------
  const [rows, setRows] = useState<StockSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filters = useAdminTableFilters({
    initialFilters: { status: '' },
    liveSearch: true,
  });

  const loadLevels = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getStockSummary();

    if (!result.ok) {
      setError(result.error.message);
    } else {
      setRows(result.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadLevels();
  }, [loadLevels]);

  // ----- write-off ("Remove from stock") -----------------------------------
  const [target, setTarget] = useState<StockSummaryRow | null>(null);
  const [woQty, setWoQty] = useState('1');
  const [woReason, setWoReason] = useState('');
  const [woError, setWoError] = useState<string | null>(null);
  const [woBusy, setWoBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const openWriteOff = useCallback((row: StockSummaryRow) => {
    setTarget(row);
    setWoQty('1');
    setWoReason('');
    setWoError(null);
  }, []);

  const submitWriteOff = async () => {
    if (!target) {
      return;
    }

    const quantity = Number.parseInt(woQty, 10);

    if (!quantity || quantity < 1 || quantity > target.totalQuantity) {
      setWoError(t('admin.writeOff.qtyRange', 'Enter a quantity between 1 and {n}', { n: target.totalQuantity }));

      return;
    }

    if (woReason.trim().length < 3) {
      setWoError(t('admin.writeOff.reasonRequired', 'Please give a short reason (at least 3 characters)'));

      return;
    }

    setWoBusy(true);
    setWoError(null);

    const result = await writeOffStock({
      productId: target.productId,
      quantity,
      reason: woReason.trim(),
    });

    setWoBusy(false);

    if (!result.ok) {
      setWoError(result.error.message);

      return;
    }

    setNotice(t('admin.writeOff.done', 'Removed {n} from {name}. {left} left.', {
      n: quantity,
      name: target.name,
      left: result.data.remaining,
    }));
    setTarget(null);
    await loadLevels();
  };

  const filtered = useMemo(() => rows.filter((row) => {
    if (!matchesSearchQuery(filters.appliedSearch, [row.name, row.sku])) {
      return false;
    }

    return !filters.appliedFilters.status || row.status === filters.appliedFilters.status;
  }), [rows, filters.appliedSearch, filters.appliedFilters]);

  const statusLabel = useCallback((status: StockSummaryRow['status']) => {
    if (status === 'out') {
      return t('admin.inventory.out', 'Out');
    }

    return status === 'low' ? t('admin.inventory.low', 'Low') : t('admin.inventory.ok', 'OK');
  }, [t]);

  const levelColumns = useMemo<ColumnDef<StockSummaryRow>[]>(() => [
    {
      accessorKey: 'name',
      header: t('admin.product', 'Product'),
      enableSorting: true,
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => row.original.sku ?? '—',
    },
    {
      accessorKey: 'totalQuantity',
      header: t('admin.inventory.onHand', 'On hand'),
      enableSorting: true,
      cell: ({ row }) => `${row.original.totalQuantity} ${row.original.unit}`,
    },
    {
      accessorKey: 'reorderLevel',
      header: t('admin.inventory.reorderLevel', 'Reorder level'),
      enableSorting: true,
    },
    {
      accessorKey: 'stockValue',
      header: t('admin.inventory.value', 'Value'),
      enableSorting: true,
      cell: ({ row }) => formatMoney(row.original.stockValue),
    },
    {
      accessorKey: 'status',
      header: t('admin.status', 'Status'),
      enableSorting: true,
      cell: ({ row }) => (
        <StatusBadge
          label={statusLabel(row.original.status)}
          tone={row.original.status === 'out' ? 'danger' : row.original.status === 'low' ? 'warning' : 'success'}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => row.original.totalQuantity > 0
        ? (
            <button
              type="button"
              onClick={() => openWriteOff(row.original)}
              className="whitespace-nowrap text-sm font-medium text-red-700 hover:underline"
            >
              {t('admin.writeOff.action', 'Remove stock')}
            </button>
          )
        : null,
    },
  ], [t, statusLabel, openWriteOff]);

  const exportLevels = () => {
    downloadCsv(
      `stock-levels-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Product', 'SKU', 'Unit', 'On hand', 'Reorder level', 'Unit price', 'Stock value', 'Status'],
      filtered.map(r => [r.name, r.sku, r.unit, r.totalQuantity, r.reorderLevel, r.price, r.stockValue, r.status]),
    );
  };

  // ----- movements (server-side pagination) --------------------------------
  const [page, setPage] = useState(1);
  const [type, setType] = useState<StockMovementType | ''>('');
  const [movements, setMovements] = useState<Paginated<StockMovement> | null>(null);
  const [mvError, setMvError] = useState<string | null>(null);
  const [mvLoading, setMvLoading] = useState(false);

  useEffect(() => {
    if (tab !== 'movements') {
      return;
    }

    let active = true;

    void (async () => {
      setMvLoading(true);
      setMvError(null);

      const result = await listStockMovements({
        page,
        limit: PAGE_SIZE,
        type: type || undefined,
      });

      if (!active) {
        return;
      }

      if (result.ok) {
        setMovements(result.data);
      } else {
        setMvError(result.error.message);
      }

      setMvLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [tab, page, type]);

  const movementColumns = useMemo<ColumnDef<StockMovement>[]>(() => [
    {
      accessorKey: 'createdAt',
      header: t('common.date', 'Date'),
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: 'product',
      header: t('admin.product', 'Product'),
      cell: ({ row }) => row.original.product?.name ?? '—',
    },
    {
      accessorKey: 'type',
      header: t('admin.inventory.type', 'Type'),
      cell: ({ row }) => (
        <span className="capitalize">{row.original.type.replace('_', ' ')}</span>
      ),
    },
    {
      accessorKey: 'change',
      header: t('admin.inventory.change', 'Change'),
      cell: ({ row }) => (
        <span className={cn('font-semibold', row.original.change > 0 ? 'text-green-700' : 'text-red-700')}>
          {row.original.change > 0 ? `+${row.original.change}` : row.original.change}
        </span>
      ),
    },
    {
      id: 'ref',
      header: t('admin.inventory.reference', 'Reference'),
      cell: ({ row }) => row.original.referenceId ? `#${row.original.referenceId}` : (row.original.note ?? '—'),
    },
  ], [t]);

  const tabClass = (active: boolean) => cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    active ? 'bg-[#428475] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  );

  return (
    <PageShell
      maxWidth="full"
      hint={t('admin.inventory.hint', 'Live stock levels, reorder alerts and the full stock audit trail.')}
      toolbar={tab === 'levels'
        ? (
            <PageToolbar
              showSearch
              searchValue={filters.draftSearch}
              onSearchChange={filters.setDraftSearch}
              showFilters
              filtersOpen={filters.filtersOpen}
              onFiltersOpenChange={filters.setFiltersOpen}
              onApplyFilters={filters.applyFilters}
              onClearFilters={filters.clearFilters}
              filterContent={(
                <AdminFilterField
                  label={t('admin.status', 'Status')}
                  htmlFor="filter-status"
                >
                  <select
                    id="filter-status"
                    value={filters.draftFilters.status}
                    onChange={e => filters.setDraftFilter('status', e.target.value)}
                    className={adminFilterSelectClass()}
                  >
                    <option value="">{t('filters.all', 'All')}</option>
                    <option value="low">{t('admin.inventory.low', 'Low')}</option>
                    <option value="out">{t('admin.inventory.out', 'Out')}</option>
                    <option value="ok">{t('admin.inventory.ok', 'OK')}</option>
                  </select>
                </AdminFilterField>
              )}
              primaryLabel={t('admin.inventory.exportCsv', 'Export CSV')}
              onPrimaryClick={exportLevels}
            />
          )
        : undefined}
    >
      <div
        className="mb-4 flex gap-2"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'levels'}
          className={tabClass(tab === 'levels')}
          onClick={() => setTab('levels')}
        >
          {t('admin.inventory.levels', 'Stock levels')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'movements'}
          className={tabClass(tab === 'movements')}
          onClick={() => setTab('movements')}
        >
          {t('admin.inventory.movements', 'Movement history')}
        </button>
      </div>

      {tab === 'levels'
        ? (
            <>
              {notice
                ? (
                    <p
                      role="status"
                      className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                    >
                      {notice}
                    </p>
                  )
                : null}
              <FormDrawer
                open={target != null}
                onOpenChange={open => !open && setTarget(null)}
                title={t('admin.writeOff.title', 'Remove from stock')}
                description={target ? `${target.name} · ${target.totalQuantity} ${target.unit} on hand` : undefined}
                onSubmit={submitWriteOff}
                submitting={woBusy}
                submitLabel={t('admin.writeOff.submit', 'Remove')}
                cancelLabel={t('admin.cancel', 'Cancel')}
                size="md"
              >
                <div className="space-y-3">
                  <div>
                    <label className={adminLabelClass} htmlFor="wo-qty">
                      {t('admin.quantity', 'Qty')}
                    </label>
                    <input
                      id="wo-qty"
                      type="number"
                      min={1}
                      max={target?.totalQuantity}
                      value={woQty}
                      onChange={e => setWoQty(e.target.value)}
                      className={adminInputClass}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className={adminLabelClass} htmlFor="wo-reason">
                      {t('admin.writeOff.reason', 'Reason')}
                    </label>
                    <input
                      id="wo-reason"
                      value={woReason}
                      onChange={e => setWoReason(e.target.value)}
                      placeholder={t('admin.writeOff.reasonPlaceholder', 'e.g. Damaged, expired, lost')}
                      maxLength={200}
                      className={adminInputClass}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {t('admin.writeOff.note', 'This is recorded in the movement history and cannot be undone here.')}
                  </p>
                  <FieldError msg={woError} variant="form" />
                </div>
              </FormDrawer>
            <CommercePageState
              loading={loading}
              error={error}
              onRetry={loadLevels}
              empty={!loading && !error && rows.length === 0}
              emptyMessage={t('admin.inventory.empty', 'No stocked products yet.')}
            >
              <DataTable
                columns={levelColumns}
                data={filtered}
                showPagination
                itemsPerPage={10}
                emptyMessage={t('admin.inventory.noMatch', 'No products match your filters.')}
              />
            </CommercePageState>
            </>
          )
        : (
            <div className="space-y-3">
              <div className="max-w-xs">
                <select
                  value={type}
                  onChange={(e) => {
                    setPage(1);
                    setType(e.target.value as StockMovementType | '');
                  }}
                  className={adminFilterSelectClass()}
                  aria-label={t('admin.inventory.type', 'Type')}
                >
                  <option value="">{t('filters.all', 'All')}</option>
                  {MOVEMENT_TYPES.map(m => (
                    <option
                      key={m}
                      value={m}
                    >
                      {m.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {mvError ? <p className="text-sm text-red-700">{mvError}</p> : null}

              <DataTable
                columns={movementColumns}
                data={movements?.data ?? []}
                emptyMessage={mvLoading
                  ? t('common.loading', 'Loading…')
                  : t('admin.inventory.noMovements', 'No stock movements yet.')}
              />

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {t('admin.inventory.pageOf', 'Page {page} of {pages} · {total} movements', {
                    page: movements?.page ?? 1,
                    pages: movements?.pages ?? 1,
                    total: movements?.total ?? 0,
                  })}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || mvLoading}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
                  >
                    {t('common.previous', 'Previous')}
                  </button>
                  <button
                    type="button"
                    disabled={!movements || page >= movements.pages || mvLoading}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
                  >
                    {t('common.next', 'Next')}
                  </button>
                </span>
              </div>
            </div>
          )}
    </PageShell>
  );
}
