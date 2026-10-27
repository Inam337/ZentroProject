import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { AppConstants } from '@/common/AppConstants';
import CommercePageState from '@/components/commerce/CommercePageState';
import ProductCard from '@/components/commerce/ProductCard';
import StatusBadge from '@/components/commerce/StatusBadge';
import { Package, ShoppingCart } from '@/components/icons/FluentIcons';
import AppButton from '@/components/ui/AppButton';
import FieldError from '@/components/ui/FieldError';
import TintedCard, { type Accent } from '@/components/ui/TintedCard';
import { useT } from '@/hooks/use-t';
import { formatMoney } from '@/libs/format-money';
import { getProductStockTotal, isLowStock } from '@/libs/product-stock';
import { cn } from '@/libs/utils';
import type { Product } from '@/models';
import { getProduct, listProducts } from '@/services/products';
import { useCartStore } from '@/stores/cart';

const categoryAccent: Accent[] = ['teal', 'mint', 'sand', 'amber', 'slate'];

export default function ProductDetailPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const addProduct = useCartStore(state => state.addProduct);
  const cartLoading = useCartStore(state => state.isLoading);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setError('Invalid product');
      setLoading(false);

      return;
    }

    setLoading(true);
    setError(null);
    setQuantity(1);
    setAdded(false);

    const [result, all] = await Promise.all([getProduct(id), listProducts()]);

    if (!result.ok) {
      setError(result.error.message);
      setLoading(false);

      return;
    }

    setProduct(result.data);

    if (all.ok) {
      setRelated(
        all.data
          .filter(p => p.id !== result.data.id && p.category?.id === result.data.category?.id)
          .slice(0, 4),
      );
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const tracked = product?.type === 'goods';
  const stock = product ? getProductStockTotal(product) : 0;
  const maxQty = tracked ? Math.max(1, stock) : 99;
  const unitPrice = product ? Number.parseFloat(String(product.price)) : 0;
  const soldOut = Boolean(tracked && stock <= 0);

  const accent = useMemo<Accent>(
    () => categoryAccent[(product?.category?.id ?? 0) % categoryAccent.length],
    [product],
  );

  const add = async (): Promise<boolean> => {
    if (!product) {
      return false;
    }

    setActionError(null);
    setAdded(false);

    const ok = await addProduct(product.id, quantity);

    if (!ok) {
      setActionError(useCartStore.getState().error);

      return false;
    }

    setAdded(true);

    return true;
  };

  const buyNow = async () => {
    if (await add()) {
      navigate(AppConstants.Routes.Private.Checkout);
    }
  };

  const stockPct = product && tracked
    ? Math.min(100, Math.round((stock / Math.max(1, product.reorderLevel * 3)) * 100))
    : 100;

  return (
    <CommercePageState
      loading={loading}
      error={error}
      onRetry={load}
      empty={!loading && !error && !product}
    >
      {product
        ? (
            <div className="w-full space-y-8">
              {/* breadcrumb */}
              <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-1.5 text-sm text-gray-600"
              >
                <Link to={AppConstants.Routes.Private.Products} className="hover:underline">
                  {t('menu.products', 'Products')}
                </Link>
                {product.category
                  ? (
                      <>
                        <span aria-hidden="true">/</span>
                        <Link
                          to={`${AppConstants.Routes.Private.Products}?categoryId=${product.category.id}`}
                          className="hover:underline"
                        >
                          {product.category.name}
                        </Link>
                      </>
                    )
                  : null}
                <span aria-hidden="true">/</span>
                <span className="font-medium text-gray-900">{product.name}</span>
              </nav>

              <div className="grid gap-6 lg:grid-cols-5">
                {/* visual */}
                <TintedCard
                  accent={accent}
                  className="flex min-h-[320px] flex-col items-center justify-center p-8 lg:col-span-2"
                >
                  <div className="flex size-40 items-center justify-center rounded-3xl bg-white/80 shadow-inner">
                    <Package className="size-20 text-[#428475]" />
                  </div>
                  <p className="mt-6 text-center text-lg font-semibold text-[#1A312C]">{product.name}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {product.sku
                      ? <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-700">{product.sku}</span>
                      : null}
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                      {product.type}
                    </span>
                  </div>
                </TintedCard>

                {/* buy box */}
                <section className="space-y-5 lg:col-span-3">
                  <div>
                    {product.category
                      ? (
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {product.category.name}
                          </span>
                        )
                      : null}
                    <h1 className="mt-2 text-3xl font-semibold text-[#1A312C]">{product.name}</h1>
                    <p className="mt-3 text-3xl font-bold text-primary">
                      {formatMoney(product.price)}
                      <span className="ml-2 text-sm font-normal text-gray-600">{`/ ${product.unit}`}</span>
                    </p>
                  </div>

                  {product.description
                    ? <p className="leading-relaxed text-gray-700">{product.description}</p>
                    : null}

                  {tracked
                    ? (
                        <div className="max-w-sm">
                          <div className="mb-1.5 flex items-center justify-between text-sm">
                            {soldOut
                              ? <StatusBadge label={t('commerce.outOfStock', 'Out of stock')} tone="danger" />
                              : isLowStock(product)
                                ? <StatusBadge label={t('commerce.lowStock', 'Only a few left')} tone="warning" />
                                : <StatusBadge label={t('commerce.inStock', 'In stock')} tone="success" />}
                            <span className="text-gray-600">
                              {t('commerce.stockAvailable', '{count} in stock', { count: stock })}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                soldOut ? 'bg-red-500' : isLowStock(product) ? 'bg-amber-500' : 'bg-[#428475]',
                              )}
                              style={{ width: `${stockPct}%` }}
                            />
                          </div>
                        </div>
                      )
                    : null}

                  <div className="rounded-xl border border-gray-200/80 bg-white/70 p-4">
                    <div className="flex flex-wrap items-end gap-6">
                      <div>
                        <span className="mb-1 block text-sm font-medium text-gray-800">
                          {t('commerce.quantity', 'Quantity')}
                        </span>
                        <div className="inline-flex items-center overflow-hidden rounded-md border border-gray-300 bg-white">
                          <button
                            type="button"
                            aria-label={t('commerce.decrease', 'Decrease quantity')}
                            disabled={quantity <= 1 || soldOut}
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="size-10 text-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                          >
                            −
                          </button>
                          <input
                            id="quantity"
                            type="number"
                            min={1}
                            max={maxQty}
                            value={quantity}
                            disabled={soldOut}
                            onChange={e => setQuantity(
                              Math.min(maxQty, Math.max(1, Number.parseInt(e.target.value, 10) || 1)),
                            )}
                            className="h-10 w-14 border-x border-gray-300 text-center [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            aria-label={t('commerce.increase', 'Increase quantity')}
                            disabled={quantity >= maxQty || soldOut}
                            onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                            className="size-10 text-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t('commerce.lineTotal', 'Total')}</p>
                        <p className="text-2xl font-semibold text-[#1A312C]">
                          {formatMoney(unitPrice * quantity)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <AppButton
                        color="primary"
                        loading={cartLoading}
                        disabled={soldOut}
                        onClick={() => void add()}
                      >
                        <span className="inline-flex items-center gap-2">
                          <ShoppingCart className="size-4" />
                          {t('commerce.addToCart', 'Add to cart')}
                        </span>
                      </AppButton>
                      <AppButton
                        color="secondary"
                        disabled={soldOut || cartLoading}
                        onClick={() => void buyNow()}
                      >
                        {t('commerce.buyNow', 'Buy now')}
                      </AppButton>
                    </div>

                    <FieldError msg={actionError} />
                    {added
                      ? (
                          <p
                            className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                            role="status"
                          >
                            {t('commerce.addedToCart', 'Added to your cart.')}
                            {' '}
                            <Link
                              to={AppConstants.Routes.Private.Cart}
                              className="font-semibold underline"
                            >
                              {t('commerce.goToCart', 'Go to cart')}
                            </Link>
                          </p>
                        )
                      : null}
                  </div>
                </section>
              </div>

              {/* specifications + stock by location */}
              <div className="grid gap-6 lg:grid-cols-5">
                <TintedCard accent="slate" className="lg:col-span-3">
                  <h2 className="mb-3 text-base font-semibold text-[#1A312C]">
                    {t('commerce.specs', 'Specifications')}
                  </h2>
                  <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                    {([
                      ['SKU', product.sku ?? '—'],
                      [t('commerce.unit', 'Unit'), product.unit],
                      [t('commerce.type', 'Type'), product.type],
                      [t('commerce.col.category', 'Category'), product.category?.name ?? '—'],
                      ...(tracked ? [[t('commerce.reorderLevel', 'Reorder level'), String(product.reorderLevel)]] : []),
                    ] as [string, string][]).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between gap-4 border-b border-gray-200/70 py-2 text-sm"
                      >
                        <dt className="text-gray-600">{k}</dt>
                        <dd className="font-medium capitalize text-gray-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </TintedCard>

                {tracked
                  ? (
                      <TintedCard accent="mint" className="lg:col-span-2">
                        <h2 className="mb-3 text-base font-semibold text-[#1A312C]">
                          {t('commerce.availability', 'Availability by location')}
                        </h2>
                        {(product.stockEntries ?? []).length === 0
                          ? <p className="text-sm text-gray-600">{t('commerce.outOfStock', 'Out of stock')}</p>
                          : (
                              <ul className="space-y-2">
                                {(product.stockEntries ?? []).map(s => (
                                  <li
                                    key={s.id}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-gray-700">{s.location}</span>
                                    <span className="font-semibold text-gray-900">{s.quantity}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                      </TintedCard>
                    )
                  : null}
              </div>

              {related.length > 0
                ? (
                    <section>
                      <h2 className="mb-3 text-lg font-semibold text-gray-900">
                        {t('commerce.related', 'More in {name}', { name: product.category?.name ?? '' })}
                      </h2>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {related.map(p => (
                          <ProductCard
                            key={p.id}
                            product={p}
                          />
                        ))}
                      </div>
                    </section>
                  )
                : null}
            </div>
          )
        : null}
    </CommercePageState>
  );
}
