import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '@/components/ui/EmptyState';
import { AppConstants } from '@/common/AppConstants';
import {
  AreaLine,
  chartColors,
  Donut,
  GroupedBars,
  HBars,
  formatCompact,
} from '@/components/admin/charts';
import LowStockChart from '@/components/admin/LowStockChart';
import TintedCard, { type Accent } from '@/components/ui/TintedCard';
import { useT } from '@/hooks/use-t';
import { formatMoney } from '@/libs/format-money';
import { cn } from '@/libs/utils';
import type {
  CategoryStockRow,
  DashboardReport,
  SalesPurchasesReport,
  StockMovement,
  StockSummaryRow,
} from '@/models';
import {
  getDashboardReport,
  getLowStock,
  getSalesPurchasesReport,
  getStockByCategory,
  getStockSummary,
  listStockMovements,
} from '@/services/inventory';

const RANGES = [7, 30, 90] as const;

/** Recent stock activity rows shown before "Show more". */
const MOVES_PREVIEW = 4;

type Range = (typeof RANGES)[number];

const isoDay = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;
};

function Kpi({
  label,
  value,
  hint,
  tone,
  accent = 'teal',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'danger' | 'warning' | 'good';
  accent?: Accent;
}) {
  const color = tone === 'danger'
    ? 'text-red-700'
    : tone === 'warning'
      ? 'text-amber-800'
      : tone === 'good' ? 'text-emerald-800' : 'text-[#1A312C]';

  return (
    <TintedCard accent={accent}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold', color)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-600">{hint}</p> : null}
    </TintedCard>
  );
}

function Panel({
  title,
  right,
  children,
  className,
  accent = 'teal',
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  accent?: Accent;
}) {
  return (
    <TintedCard
      accent={accent}
      className={cn('flex flex-col', className)}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-[#1A312C]">{title}</h4>
        {right}
      </div>
      <div className="flex-1">{children}</div>
    </TintedCard>
  );
}

export default function AdminDashboardPanel() {
  const { t } = useT();
  const [range, setRange] = useState<Range>(30);
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [series, setSeries] = useState<SalesPurchasesReport | null>(null);
  const [low, setLow] = useState<StockSummaryRow[]>([]);
  const [summary, setSummary] = useState<StockSummaryRow[]>([]);
  const [categories, setCategories] = useState<CategoryStockRow[]>([]);
  const [moves, setMoves] = useState<StockMovement[]>([]);
  const [showAllMoves, setShowAllMoves] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Everything except the date-range chart loads once.
  useEffect(() => {
    let active = true;

    void (async () => {
      const [r, l, s, c, m] = await Promise.all([
        getDashboardReport(),
        getLowStock(),
        getStockSummary(),
        getStockByCategory(),
        listStockMovements({ page: 1, limit: 8 }),
      ]);

      if (!active) {
        return;
      }

      if (!r.ok) {
        setError(r.error.message);

        return;
      }

      setReport(r.data);
      setLow(l.ok ? l.data : []);
      setSummary(s.ok ? s.data : []);
      setCategories(c.ok ? c.data : []);
      setMoves(m.ok ? m.data.data : []);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const to = new Date();
    const from = new Date(to.getTime() - (range - 1) * 24 * 60 * 60 * 1000);

    void getSalesPurchasesReport(isoDay(from), isoDay(to)).then((res) => {
      if (active && res.ok) {
        setSeries(res.data);
      }
    });

    return () => {
      active = false;
    };
  }, [range]);

  const bars = useMemo(() => (series?.series ?? []).map(d => ({
    label: d.date.slice(5),
    a: d.sales,
    b: d.purchases,
    title: `${d.date}\n${t('admin.dashboard.sales', 'Sales')}: ${formatMoney(d.sales)}\n${t('admin.dashboard.purchases', 'Purchases')}: ${formatMoney(d.purchases)}`,
  })), [series, t]);

  const cumulative = useMemo(() => {
    let running = 0;

    return (series?.series ?? []).map((d) => {
      running += d.sales - d.purchases;

      return { label: d.date.slice(5), value: running };
    });
  }, [series]);

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (!report) {
    return <p className="text-sm text-gray-600">{t('common.loading', 'Loading…')}</p>;
  }

  const ok = summary.filter(r => r.status === 'ok').length;
  const net = (series?.totalSales ?? 0) - (series?.totalPurchases ?? 0);
  const orders = report.ordersByStatus;
  const orderTotal = Object.values(orders).reduce((s, n) => s + n, 0);
  const rangeLabel = t('admin.dashboard.lastN', 'Last {n} days', { n: range });

  return (
    <section
      className="space-y-4"
      aria-label={t('admin.dashboard.overviewTitle', 'Inventory overview')}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('admin.dashboard.overviewTitle', 'Inventory overview')}
        </h3>
        <div
          className="inline-flex rounded-md bg-gray-100 p-0.5"
          role="group"
          aria-label={t('admin.dashboard.range', 'Date range')}
        >
          {RANGES.map(n => (
            <button
              key={n}
              type="button"
              aria-pressed={range === n}
              onClick={() => setRange(n)}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium transition-colors',
                range === n ? 'bg-[#428475] text-white' : 'text-gray-700 hover:bg-gray-200',
              )}
            >
              {`${n}d`}
            </button>
          ))}
        </div>
      </div>

      {/* ---- stat cards ---- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          accent="teal"
          label={t('admin.dashboard.stockValue', 'Stock value')}
          value={formatMoney(report.stockValue)}
          hint={t('admin.dashboard.units', '{n} units across {p} products', {
            n: report.stockUnits,
            p: report.products,
          })}
        />
        <Kpi
          label={t('admin.dashboard.lowStock', 'Low stock')}
          value={String(report.lowStockCount)}
          hint={t('admin.dashboard.outOfStock', '{n} out of stock', { n: report.outOfStockCount })}
          tone={report.lowStockCount + report.outOfStockCount > 0 ? 'warning' : 'good'}
          accent={report.lowStockCount + report.outOfStockCount > 0 ? 'amber' : 'mint'}
        />
        <Kpi
          accent="mint"
          label={t('admin.dashboard.salesToday', 'Sales today')}
          value={formatMoney(report.salesToday.total)}
          hint={t('admin.dashboard.salesCount', '{n} sales', { n: report.salesToday.count })}
        />
        <Kpi
          accent="sand"
          label={t('admin.dashboard.purchasesToday', 'Purchases today')}
          value={formatMoney(report.purchasesToday.total)}
          hint={t('admin.dashboard.purchasesCount', '{n} purchases', { n: report.purchasesToday.count })}
        />
        <Kpi
          accent="teal"
          label={t('admin.dashboard.salesRange', 'Sales ({range})', { range: `${range}d` })}
          value={formatMoney(series?.totalSales ?? 0)}
        />
        <Kpi
          accent="slate"
          label={t('admin.dashboard.purchasesRange', 'Purchases ({range})', { range: `${range}d` })}
          value={formatMoney(series?.totalPurchases ?? 0)}
        />
        <Kpi
          label={t('admin.dashboard.net', 'Net cash flow')}
          value={formatMoney(net)}
          hint={t('admin.dashboard.netHint', 'Sales minus purchases')}
          tone={net >= 0 ? 'good' : 'danger'}
          accent={net >= 0 ? 'mint' : 'rose'}
        />
        <Kpi
          accent="amber"
          label={t('admin.dashboard.pendingOrders', 'Pending orders')}
          value={String(orders.pending ?? 0)}
          hint={t('admin.dashboard.ordersTotal', '{n} orders in total', { n: orderTotal })}
          tone={(orders.pending ?? 0) > 0 ? 'warning' : undefined}
        />
      </div>

      {/* ---- near out of stock ---- */}
      <LowStockChart items={low} />

      {/* ---- trend charts ---- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          accent="teal"
          title={`${t('admin.dashboard.salesVsPurchases', 'Sales vs purchases')} · ${rangeLabel}`}
          className="lg:col-span-2"
          right={(
            <span className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <i
                  className="inline-block size-2 rounded-sm"
                  style={{ background: chartColors.teal }}
                />
                {t('admin.dashboard.sales', 'Sales')}
              </span>
              <span className="flex items-center gap-1">
                <i
                  className="inline-block size-2 rounded-sm"
                  style={{ background: chartColors.mint }}
                />
                {t('admin.dashboard.purchases', 'Purchases')}
              </span>
            </span>
          )}
        >
          <GroupedBars
            data={bars}
            ariaLabel={t('admin.dashboard.chartLabel', 'Sales and purchases per day')}
          />
        </Panel>

        <Panel
          accent="mint" title={t('admin.dashboard.cumulative', 'Cumulative net cash flow')}>
          <AreaLine
            data={cumulative}
            ariaLabel={t('admin.dashboard.cumulativeLabel', 'Running total of sales minus purchases')}
            format={n => formatCompact(n)}
          />
        </Panel>
      </div>

      {/* ---- distribution charts ---- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          accent="teal" title={t('admin.dashboard.stockHealth', 'Stock health')}>
          <Donut
            stacked
            ariaLabel={t('admin.dashboard.stockHealthLabel', 'Products by stock status')}
            centerValue={String(summary.length)}
            centerLabel={t('admin.dashboard.products', 'products')}
            slices={[
              { label: t('admin.inventory.ok', 'OK'), value: ok, color: chartColors.teal },
              { label: t('admin.inventory.low', 'Low'), value: report.lowStockCount, color: chartColors.amber },
              { label: t('admin.inventory.out', 'Out'), value: report.outOfStockCount, color: chartColors.red },
            ]}
          />
        </Panel>

        <Panel
          accent="slate" title={t('admin.dashboard.ordersByStatus', 'Orders by status')}>
          <Donut
            stacked
            variant="rings"
            ariaLabel={t('admin.dashboard.ordersLabel', 'Orders by status')}
            centerValue={String(orderTotal)}
            centerLabel={t('admin.dashboard.orders', 'orders')}
            slices={[
              { label: t('admin.dashboard.pending', 'Pending'), value: orders.pending ?? 0, color: '#4F7CF0' },
              { label: t('admin.dashboard.confirmed', 'Confirmed'), value: orders.confirmed ?? 0, color: '#8B5CF6' },
              { label: t('admin.cancelled', 'Cancelled'), value: orders.cancelled ?? 0, color: '#E5566D' },
            ]}
          />
        </Panel>

        <Panel
          accent="sand" title={t('admin.dashboard.valueByCategory', 'Stock value by category')}>
          {categories.length === 0
            ? (
                <EmptyState
                  compact
                  fill
                  kind="stock"
                  message={t('admin.inventory.empty', 'No stocked products yet.')}
                />
              )
            : (
                <div className="flex h-full flex-col gap-4">
                  <HBars
                    items={categories.map(c => ({
                    label: c.category,
                    value: c.value,
                    hint: t('admin.dashboard.catHint', '{u} units · {p} products', { u: c.units, p: c.products }),
                    }))}
                  />
                  <div className="mt-auto rounded-lg bg-white/75 px-3 py-2.5 ring-1 ring-black/5">
                    <p className="text-xs text-gray-600">{t('admin.dashboard.stockValue', 'Stock value')}</p>
                    <p className="text-xl font-semibold text-[#1A312C]">{formatMoney(report.stockValue)}</p>
                  </div>
                </div>
              )}
        </Panel>
      </div>

      {/* ---- lists ---- */}
      <div className="grid gap-4 lg:grid-cols-2">

        <Panel
          accent="mint" title={t('admin.dashboard.topProducts', 'Top products (30 days)')}>
          {report.topProducts.length === 0
            ? (
                <EmptyState
                  compact
                  fill
                  kind="sales"
                  title={t('admin.dashboard.noSales', 'No sales in this period')}
                  description={t('admin.dashboard.noSalesHint', 'Your best-selling products will appear here once sales are recorded.')}
                />
              )
            : (
                <HBars
                  items={report.topProducts.map(p => ({
                    label: p.name,
                    value: p.revenue,
                    hint: t('admin.dashboard.sold', '{n} sold', { n: p.quantity }),
                  }))}
                  format={n => formatMoney(n)}
                  color={chartColors.mint}
                />
              )}
        </Panel>

        <Panel
          accent="slate"
          title={t('admin.dashboard.recent', 'Recent stock activity')}
          right={(
            <Link
              to={AppConstants.Routes.Private.Admin.Inventory}
              className="text-xs font-medium text-[#428475] hover:underline"
            >
              {t('admin.dashboard.viewAll', 'View all')}
            </Link>
          )}
        >
          {moves.length === 0
            ? (
                <EmptyState
                  compact
                  fill
                  kind="movements"
                  message={t('admin.inventory.noMovements', 'No stock movements yet.')}
                />
              )
            : (
                <>
                <ul className="space-y-2">
                  {(showAllMoves ? moves : moves.slice(0, MOVES_PREVIEW)).map(m => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-gray-800">{m.product?.name ?? '—'}</span>
                        <span className="block text-[11px] capitalize text-gray-600">
                          {`${m.type.replace('_', ' ')} · ${new Date(m.createdAt).toLocaleTimeString()}`}
                        </span>
                      </span>
                      <span className={cn('shrink-0 font-semibold', m.change > 0 ? 'text-emerald-700' : 'text-red-700')}>
                        {m.change > 0 ? `+${m.change}` : m.change}
                      </span>
                    </li>
                  ))}
                </ul>
                {moves.length > MOVES_PREVIEW
                  ? (
                      <button
                        type="button"
                        onClick={() => setShowAllMoves(v => !v)}
                        aria-expanded={showAllMoves}
                        className={[
                          'mt-3 w-full rounded-lg border border-black/10 bg-white/70 py-1.5 text-sm font-medium',
                          'text-[#428475] transition-colors hover:bg-white',
                        ].join(' ')}
                      >
                        {showAllMoves
                          ? t('admin.dashboard.showLess', 'Show less')
                          : t('admin.dashboard.showMore', 'Show {n} more', { n: moves.length - MOVES_PREVIEW })}
                      </button>
                    )
                  : null}
                </>
              )}
        </Panel>
      </div>
    </section>
  );
}
