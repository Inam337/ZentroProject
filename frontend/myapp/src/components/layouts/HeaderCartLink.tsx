import { Link } from 'react-router-dom';

import { AppConstants } from '@/common/AppConstants';
import { ShoppingCart } from '@/components/icons/FluentIcons';
import { useT } from '@/hooks/use-t';
import { cn } from '@/libs/utils';
import { useCartStore } from '@/stores/cart';

export default function HeaderCartLink() {
  const { t } = useT();
  const itemCount = useCartStore(state => state.itemCount);

  return (
    <Link
      to={AppConstants.Routes.Private.Cart}
      className={cn(
        'relative flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#428475]',
        itemCount > 0
          ? 'border-[#BFEBD7] bg-[#DDF6EB] text-[#1A312C] hover:bg-[#CDF0E1]'
          : 'border-[#D9E7E1] bg-white/80 text-[#1A312C] hover:bg-[#E1F0EA]',
      )}
      aria-label={
        itemCount > 0
          ? t('commerce.cartWithCount', 'Cart, {n} items', { n: itemCount })
          : t('commerce.cart', 'Cart')
      }
    >
      <ShoppingCart className="size-5 text-[#428475]" />
      <span className="hidden sm:inline">{t('commerce.cart', 'Cart')}</span>
      {itemCount > 0
        ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1A312C] px-1.5 text-xs font-semibold text-white">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )
        : null}
    </Link>
  );
}
