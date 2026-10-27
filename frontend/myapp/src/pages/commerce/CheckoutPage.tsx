import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AppConstants } from '@/common/AppConstants';
import CommercePageState from '@/components/commerce/CommercePageState';
import { Package } from '@/components/icons/FluentIcons';
import AppButton from '@/components/ui/AppButton';
import FieldError from '@/components/ui/FieldError';
import TintedCard from '@/components/ui/TintedCard';
import { useT } from '@/hooks/use-t';
import { formatMoney } from '@/libs/format-money';
import { cn } from '@/libs/utils';
import { checkout } from '@/services/orders';
import { useCartStore } from '@/stores/cart';

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const { t } = useT();
  const steps = [
    t('commerce.step.cart', 'Cart'),
    t('commerce.step.review', 'Review & place order'),
    t('commerce.step.pay', 'Payment'),
  ];

  return (
    <ol
      className="flex flex-wrap items-center gap-2 text-sm"
      aria-label={t('commerce.step.label', 'Checkout progress')}
    >
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;

        return (
          <li
            key={label}
            className="flex items-center gap-2"
            aria-current={active ? 'step' : undefined}
          >
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                done && 'bg-[#428475] text-white',
                active && 'bg-[#1A312C] text-white',
                !done && !active && 'bg-gray-200 text-gray-700',
              )}
            >
              {done ? '✓' : n}
            </span>
            <span className={cn(active ? 'font-semibold text-[#1A312C]' : 'text-gray-600')}>{label}</span>
            {n < steps.length ? <span aria-hidden="true" className="mx-1 h-px w-8 bg-gray-300" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function CheckoutPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const cart = useCartStore(state => state.cart);
  const fetchCart = useCartStore(state => state.fetchCart);
  const isLoading = useCartStore(state => state.isLoading);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const items = cart?.items ?? [];
  const units = items.reduce((n, line) => n + line.quantity, 0);
  const subtotal = items.reduce(
    (sum, line) => sum + Number.parseFloat(String(line.product.price)) * line.quantity,
    0,
  );

  const handleCheckout = async () => {
    setSubmitting(true);
    setError(null);

    const result = await checkout();

    if (!result.ok) {
      setError(result.error.message);
      setSubmitting(false);

      return;
    }

    await fetchCart();
    navigate(AppConstants.RouteBuilders.order(result.data.id), { replace: true });
  };

  return (
    <CommercePageState
      loading={isLoading && !cart}
      empty={!isLoading && items.length === 0}
      emptyMessage={t('commerce.checkout.emptyCart', 'Add items to your cart before checkout.')}
    >
      {items.length > 0
        ? (
            <div className="w-full space-y-6">
              <Steps current={2} />

              <div className="grid items-start gap-6 lg:grid-cols-3">
                {/* ---- review ---- */}
                <section className="space-y-4 lg:col-span-2">
                  <TintedCard accent="teal" className="p-0">
                    <div className="flex items-center justify-between border-b border-[#C8E2D8] px-5 py-4">
                      <h2 className="text-lg font-semibold text-[#1A312C]">
                        {t('commerce.reviewOrder', 'Review your order')}
                      </h2>
                      <Link
                        to={AppConstants.Routes.Private.Cart}
                        className="text-sm font-medium text-[#428475] hover:underline"
                      >
                        {t('commerce.editCart', 'Edit cart')}
                      </Link>
                    </div>
                    <ul className="divide-y divide-[#DCEBE5] bg-white/60">
                      {items.map((line) => {
                        const price = Number.parseFloat(String(line.product.price));

                        return (
                          <li
                            key={line.id}
                            className="flex items-center gap-4 px-5 py-4"
                          >
                            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#E1F0EA] text-[#428475]">
                              <Package className="size-7" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <Link
                                to={AppConstants.RouteBuilders.product(line.product.id)}
                                className="block truncate font-medium text-[#1A312C] hover:underline"
                              >
                                {line.product.name}
                              </Link>
                              <p className="text-sm text-gray-600">
                                {`${formatMoney(price)} × ${line.quantity}`}
                                {line.product.unit ? ` · ${line.product.unit}` : ''}
                              </p>
                            </div>
                            <p className="shrink-0 font-semibold text-[#1A312C]">
                              {formatMoney(price * line.quantity)}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </TintedCard>

                  <TintedCard accent="sand">
                    <h3 className="text-sm font-semibold text-[#1A312C]">
                      {t('commerce.paymentNextTitle', 'Payment comes next')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-700">
                      {t(
                        'commerce.paymentNext',
                        'Placing the order reserves your items. You will choose how to pay (cash on delivery, Stripe, JazzCash or Easypaisa) on the order page.',
                      )}
                    </p>
                  </TintedCard>
                </section>

                {/* ---- summary ---- */}
                <aside className="lg:sticky lg:top-4">
                  <TintedCard accent="mint" className="space-y-4 p-5">
                    <h2 className="text-lg font-semibold text-[#1A312C]">
                      {t('commerce.orderSummary', 'Order summary')}
                    </h2>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-700">{t('commerce.summary.items', 'Items')}</dt>
                        <dd className="font-medium text-gray-900">{units}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-700">{t('commerce.subtotal', 'Subtotal')}</dt>
                        <dd className="font-medium text-gray-900">{formatMoney(subtotal)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-700">{t('commerce.delivery', 'Delivery')}</dt>
                        <dd className="font-medium text-gray-900">{t('commerce.free', 'Free')}</dd>
                      </div>
                    </dl>
                    <div className="flex items-baseline justify-between border-t border-[#BFEBD7] pt-4">
                      <span className="font-semibold text-[#1A312C]">{t('commerce.estimatedTotal', 'Estimated total')}</span>
                      <span className="text-2xl font-bold text-[#1A312C]">{formatMoney(subtotal)}</span>
                    </div>

                    <FieldError msg={error} variant="form" />

                    <AppButton
                      color="primary"
                      loading={submitting}
                      className="w-full"
                      onClick={() => void handleCheckout()}
                    >
                      {t('commerce.placeOrder', 'Place order')}
                    </AppButton>
                    <p className="text-center text-xs text-gray-600">
                      {t('commerce.priceNote', 'Final prices are confirmed by the store when the order is placed.')}
                    </p>
                    <Link
                      to={AppConstants.Routes.Private.Cart}
                      className="block text-center text-sm font-medium text-[#428475] hover:underline"
                    >
                      {t('commerce.backToCart', 'Back to cart')}
                    </Link>
                  </TintedCard>
                </aside>
              </div>
            </div>
          )
        : (
            <Link
              to={AppConstants.Routes.Private.Products}
              className="text-sm text-primary hover:underline"
            >
              {t('commerce.browseProducts', 'Browse products')}
            </Link>
          )}
    </CommercePageState>
  );
}
