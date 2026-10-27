import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { adminInputClass } from '@/components/admin/admin-form-styles';
import CommercePageState from '@/components/commerce/CommercePageState';
import StatusBadge from '@/components/commerce/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import PageShell from '@/components/ui/PageShell';
import TintedCard from '@/components/ui/TintedCard';
import { useT } from '@/hooks/use-t';
import { formatMoney } from '@/libs/format-money';
import { invoiceNumber, printSaleInvoice } from '@/libs/print-invoice';
import type { Sale } from '@/models';
import { cancelSale, listSales } from '@/services/sales';

type StatusFilter = '' | 'completed' | 'cancelled';

const isoDay = (value?: string): string => (value ? value.slice(0, 10) : '');

function Stat({ label, value, hint, accent }: {
  label: string;
  value: string;
  hint?: string;
  accent: 'teal' | 'mint' | 'rose' | 'sand';
}) {
  return (
    <TintedCard accent={accent}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#1A312C]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-600">{hint}</p> : null}
    </TintedCard>
  );
}

export default function AdminInvoicesPage() {
  const { t } = useT();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await listSales();

    if (result.ok) {
      setSales(result.data);
    } else {
      setError(result.error.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCancel = useCallback(async (sale: Sale) => {
    if (!window.confirm(t('admin.confirmCancelInvoice', 'Cancel {no}? Stock will be returned.', {
      no: invoiceNumber(sale.id),
    }))) {
      return;
    }

    const result = await cancelSale(sale.id);

    if (!result.ok) {
      setError(result.error.message);

      return;
    }

    await load();
  }, [load, t]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return sales.filter((s) => {
      if (status && (s.status ?? 'completed') !== status) {
        return false;
      }

      const day = isoDay(s.soldAt);

      if (from && day < from) {
        return false;
      }

      if (to && day > to) {
        return false;
      }

      return !q || invoiceNumber(s.id).toLowerCase().includes(q)
        || (s.customer?.name ?? 'walk-in').toLowerCase().includes(q);
    });
  }, [sales, search, status, from, to]);

  const stats = useMemo(() => {
    const done = filtered.filter(s => (s.status ?? 'completed') === 'completed');
    const total = done.reduce((sum, s) => sum + Number.parseFloat(String(s.totalAmount)), 0);

    return {
      count: filtered.length,
      total,
      average: done.length ? total / done.length : 0,
      cancelled: filtered.length - done.length,
    };
  }, [filtered]);

  const columns = useMemo<ColumnDef<Sale>[]>(() => [
    {
      id: 'number',
      accessorFn: row => row.id,
      header: t('admin.invoice.number', 'Invoice'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-semibold text-[#1A312C]">{invoiceNumber(row.original.id)}</span>
      ),
    },
    {
      id: 'date',
      accessorFn: row => row.soldAt ?? '',
      header: t('common.date', 'Date'),
      enableSorting: true,
      cell: ({ row }) => row.original.soldAt
        ? new Date(row.original.soldAt).toLocaleDateString()
        : '—',
    },
    {
      id: 'customer',
      accessorFn: row => row.customer?.name ?? '',
      header: t('admin.customer', 'Customer'),
      enableSorting: true,
      cell: ({ row }) => row.original.customer?.name ?? t('admin.walkIn', 'Walk-in customer'),
    },
    {
      id: 'items',
      accessorFn: row => row.items?.reduce((n, i) => n + i.quantity, 0) ?? 0,
      header: t('admin.invoice.units', 'Units'),
      enableSorting: true,
    },
    {
      id: 'total',
      accessorFn: row => Number.parseFloat(String(row.totalAmount)),
      header: t('common.total', 'Total'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-semibold">{formatMoney(row.original.totalAmount)}</span>
      ),
    },
    {
      id: 'status',
      accessorFn: row => row.status ?? 'completed',
      header: t('admin.status', 'Status'),
      enableSorting: true,
      cell: ({ row }) => row.original.status === 'cancelled'
        ? <StatusBadge label={t('admin.cancelled', 'Cancelled')} tone="danger" />
        : <StatusBadge label={t('admin.completed', 'Completed')} tone="success" />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-4 whitespace-nowrap text-sm font-medium">
          <button
            type="button"
            onClick={() => printSaleInvoice(row.original)}
            className="text-[#428475] hover:underline"
          >
            {t('admin.invoice.view', 'View / Print')}
          </button>
          {row.original.status === 'cancelled'
            ? null
            : (
                <button
                  type="button"
                  onClick={() => void handleCancel(row.original)}
                  className="text-amber-700 hover:underline"
                >
                  {t('admin.cancel', 'Cancel')}
                </button>
              )}
        </div>
      ),
    },
  ], [t, handleCancel]);

  const hasFilters = Boolean(search || status || from || to);

  return (
    <CommercePageState
      loading={loading}
      error={error}
      onRetry={load}
      empty={!loading && !error && sales.length === 0}
      emptyMessage={t('admin.invoice.empty', 'No invoices yet. Record a sale to create one.')}
    >
      <PageShell
        maxWidth="full"
        hint={t('admin.invoice.hint', 'Every sale is an invoice. Search, filter by date or status, print or cancel.')}
      >
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label={t('admin.invoice.count', 'Invoices')}
            value={String(stats.count)}
            accent="teal"
          />
          <Stat
            label={t('admin.invoice.invoiced', 'Total invoiced')}
            value={formatMoney(stats.total)}
            hint={t('admin.invoice.excludingCancelled', 'Excluding cancelled')}
            accent="mint"
          />
          <Stat
            label={t('admin.invoice.average', 'Average invoice')}
            value={formatMoney(Math.round(stats.average))}
            accent="sand"
          />
          <Stat
            label={t('admin.cancelled', 'Cancelled')}
            value={String(stats.cancelled)}
            accent={stats.cancelled > 0 ? 'rose' : 'mint'}
          />
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200/80 bg-white/70 p-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="inv-search">
              {t('common.search', 'Search')}
            </label>
            <input
              id="inv-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.invoice.searchPlaceholder', 'Invoice number or customer…')}
              className={adminInputClass}
            />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="inv-status">
              {t('admin.status', 'Status')}
            </label>
            <select
              id="inv-status"
              value={status}
              onChange={e => setStatus(e.target.value as StatusFilter)}
              className={adminInputClass}
            >
              <option value="">{t('filters.all', 'All')}</option>
              <option value="completed">{t('admin.completed', 'Completed')}</option>
              <option value="cancelled">{t('admin.cancelled', 'Cancelled')}</option>
            </select>
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="inv-from">
              {t('admin.invoice.from', 'From')}
            </label>
            <input
              id="inv-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={e => setFrom(e.target.value)}
              className={adminInputClass}
            />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="inv-to">
              {t('admin.invoice.to', 'To')}
            </label>
            <input
              id="inv-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={e => setTo(e.target.value)}
              className={adminInputClass}
            />
          </div>
          {hasFilters
            ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatus('');
                    setFrom('');
                    setTo('');
                  }}
                  className="h-10 rounded-md px-3 text-sm font-medium text-[#428475] hover:underline"
                >
                  {t('filters.clear', 'Clear filters')}
                </button>
              )
            : null}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          showPagination
          itemsPerPage={10}
          emptyMessage={t('admin.invoice.noMatch', 'No invoices match your filters.')}
        />
      </PageShell>
    </CommercePageState>
  );
}
