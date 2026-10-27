import EmptyState from '@/components/ui/EmptyState';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Link, useSearchParams } from 'react-router-dom';

import { AppConstants } from '@/common/AppConstants';
import { adminInputClass } from '@/components/admin/admin-form-styles';
import CommercePageState from '@/components/commerce/CommercePageState';
import ProductCard from '@/components/commerce/ProductCard';
import StatusBadge from '@/components/commerce/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import { useT } from '@/hooks/use-t';
import { formatMoney } from '@/libs/format-money';
import { getProductStockTotal, isLowStock } from '@/libs/product-stock';
import { cn } from '@/libs/utils';
import type { Category, Product } from '@/models';
import { listCategories } from '@/services/categories';
import { listProducts } from '@/services/products';

type StockFilter = '' | 'in' | 'low' | 'out';
type View = 'table' | 'cards';

const chip = (active: boolean) => cn(
  'rounded-full border px-3 py-1 text-sm transition-colors',
  active
    ? 'border-primary bg-primary text-white'
    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
);

export default function ProductsPage() {
  const { t } = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [view, setView] = useState<View>('table');

  const categoryId = searchParams.get('categoryId');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [productsResult, categoriesResult] = await Promise.all([
      listProducts(),
      listCategories(),
    ]);

    if (!productsResult.ok) {
      setError(productsResult.error.message);
      setLoading(false);

      return;
    }

    setProducts(productsResult.data);

    if (categoriesResult.ok) {
      setCategories(categoriesResult.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setCategoryFilter = (id: number | null) => {
    setSearchParams(id == null ? {} : { categoryId: String(id) });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minPrice === '' ? null : Number.parseFloat(minPrice);
    const max = maxPrice === '' ? null : Number.parseFloat(maxPrice);
    const catId = categoryId ? Number.parseInt(categoryId, 10) : null;

    return products.filter((p) => {
      if (catId != null && p.category?.id !== catId) {
        return false;
      }

      if (q && ![p.name, p.sku, p.description, p.category?.name]
        .some(v => v?.toLowerCase().includes(q))) {
        return false;
      }

      const price = Number.parseFloat(String(p.price));

      if (min != null && !Number.isNaN(min) && price < min) {
        return false;
      }

      if (max != null && !Number.isNaN(max) && price > max) {
        return false;
      }

      const stock = getProductStockTotal(p);

      if (stockFilter === 'out') {
        return stock === 0;
      }

      if (stockFilter === 'low') {
        return isLowStock(p);
      }

      return stockFilter === 'in' ? stock > 0 : true;
    });
  }, [products, search, categoryId, minPrice, maxPrice, stockFilter]);

  const hasFilters = Boolean(search || categoryId || stockFilter || minPrice || maxPrice);

  const clearAll = () => {
    setSearch('');
    setStockFilter('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      accessorKey: 'name',
      header: t('commerce.col.product', 'Product'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className="min-w-[200px]">
          <p className="font-medium text-gray-900">{row.original.name}</p>
          {row.original.description
            ? <p className="line-clamp-1 text-xs text-gray-600">{row.original.description}</p>
            : null}
        </div>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      enableSorting: true,
      cell: ({ row }) => row.original.sku ?? '—',
    },
    {
      id: 'category',
      accessorFn: row => row.category?.name ?? '',
      header: t('commerce.col.category', 'Category'),
      enableSorting: true,
      cell: ({ row }) => row.original.category
        ? (
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              {row.original.category.name}
            </span>
          )
        : '—',
    },
    {
      id: 'price',
      accessorFn: row => Number.parseFloat(String(row.price)),
      header: t('commerce.col.price', 'Price'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-semibold text-primary">{formatMoney(row.original.price)}</span>
      ),
    },
    {
      accessorKey: 'unit',
      header: t('commerce.col.unit', 'Unit'),
      enableSorting: true,
    },
    {
      id: 'stock',
      accessorFn: row => getProductStockTotal(row),
      header: t('commerce.col.stock', 'Stock'),
      enableSorting: true,
      cell: ({ row }) => {
        const stock = getProductStockTotal(row.original);

        if (stock === 0) {
          return <StatusBadge label={t('commerce.outOfStock', 'Out of stock')} tone="danger" />;
        }

        return isLowStock(row.original)
          ? <StatusBadge label={`${stock} · ${t('admin.inventory.low', 'Low')}`} tone="warning" />
          : <StatusBadge label={String(stock)} tone="success" />;
      },
    },
    {
      id: 'view',
      header: '',
      cell: ({ row }) => (
        <Link
          to={AppConstants.RouteBuilders.product(row.original.id)}
          className="whitespace-nowrap text-sm font-medium text-primary hover:underline"
        >
          {t('commerce.viewProduct', 'View details')}
        </Link>
      ),
    },
  ], [t]);

  return (
    <CommercePageState
      loading={loading}
      error={error}
      onRetry={load}
      empty={!loading && !error && products.length === 0}
      emptyMessage={t('commerce.products.empty', 'No products found.')}
    >
      <div className="w-full space-y-4">
        {categories.length > 0
          ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter(null)}
                  className={chip(!categoryId)}
                >
                  {t('commerce.allCategories', 'All')}
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryFilter(category.id)}
                    className={chip(categoryId === String(category.id))}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )
          : null}

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200/80 bg-white/70 p-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="p-search">
              {t('common.search', 'Search')}
            </label>
            <input
              id="p-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('commerce.searchProducts', 'Name, SKU, description…')}
              className={adminInputClass}
            />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="p-stock">
              {t('commerce.col.stock', 'Stock')}
            </label>
            <select
              id="p-stock"
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as StockFilter)}
              className={adminInputClass}
            >
              <option value="">{t('filters.all', 'All')}</option>
              <option value="in">{t('commerce.inStock', 'In stock')}</option>
              <option value="low">{t('admin.inventory.low', 'Low')}</option>
              <option value="out">{t('commerce.outOfStock', 'Out of stock')}</option>
            </select>
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="p-min">
              {t('commerce.minPrice', 'Min price')}
            </label>
            <input
              id="p-min"
              type="number"
              min={0}
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className={adminInputClass}
            />
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="p-max">
              {t('commerce.maxPrice', 'Max price')}
            </label>
            <input
              id="p-max"
              type="number"
              min={0}
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className={adminInputClass}
            />
          </div>
          {hasFilters
            ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="h-10 rounded-md px-3 text-sm font-medium text-primary hover:underline"
                >
                  {t('filters.clear', 'Clear filters')}
                </button>
              )
            : null}
          <div
            className="ml-auto inline-flex rounded-md bg-gray-100 p-0.5"
            role="group"
            aria-label={t('commerce.view', 'View')}
          >
            {(['table', 'cards'] as const).map(v => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn(
                  'rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  view === v ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-200',
                )}
              >
                {v === 'table' ? t('commerce.viewTable', 'Table') : t('commerce.viewCards', 'Cards')}
              </button>
            ))}
          </div>
        </div>

        {view === 'table'
          ? (
              <DataTable
                columns={columns}
                data={filtered}
                showPagination
                itemsPerPage={10}
                emptyMessage={t('commerce.products.noMatch', 'No products match your filters.')}
              />
            )
          : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
                {filtered.length === 0
                  ? (
                      <EmptyState
                        className="col-span-full"
                        message={t('commerce.products.noMatch', 'No products match your filters.')}
                      />
                    )
                  : null}
              </div>
            )}
      </div>
    </CommercePageState>
  );
}
