import type { ReactNode } from 'react';

import { useT } from '@/hooks/use-t';
import { cn } from '@/libs/utils';

export type EmptyKind =
  | 'sales'
  | 'products'
  | 'orders'
  | 'users'
  | 'suppliers'
  | 'customers'
  | 'stock'
  | 'categories'
  | 'purchases'
  | 'invoices'
  | 'movements'
  | 'search'
  | 'default';

/** Line icons (24x24 grid, stroke only) so they inherit the tone colour. */
const icons: Record<EmptyKind, ReactNode> = {
  sales: (
    <>
      <path d="M3 17l5-5 4 4 8-9" />
      <path d="M15 7h5v5" />
    </>
  ),
  products: (
    <>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </>
  ),
  orders: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <path d="M16 4.7a3.5 3.5 0 010 6.6M18 14.8c1.8.7 3 2.4 3.5 5.2" />
    </>
  ),
  suppliers: (
    <>
      <path d="M2 7h12v9H2zM14 10h4l3 3v3h-7" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </>
  ),
  customers: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.7-4 3.8-6 8-6s7.3 2 8 6" />
    </>
  ),
  stock: (
    <>
      <path d="M3 9l9-5 9 5v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
      <path d="M8 20v-7h8v7M8 16.5h8" />
    </>
  ),
  categories: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  purchases: (
    <>
      <path d="M3 4h2.5l2.2 10.2a1 1 0 001 .8h8.6a1 1 0 001-.8L20 8H6.2" />
      <circle cx="9.5" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
    </>
  ),
  invoices: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  movements: (
    <>
      <path d="M7 7h12l-3-3M17 17H5l3 3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5M8.5 11h5" />
    </>
  ),
  default: (
    <>
      <path d="M4 13l2-8h12l2 8" />
      <path d="M4 13v6h16v-6h-5l-1 2h-4l-1-2H4z" />
    </>
  ),
};

/** Short hint shown under the title when the caller only passes a one-line message. */
const hints: Record<EmptyKind, [string, string]> = {
  sales: ['empty.hint.sales', 'Recorded sales will appear here.'],
  products: ['empty.hint.products', 'Products will show up here once they are added.'],
  orders: ['empty.hint.orders', 'Orders will appear here as soon as they are placed.'],
  users: ['empty.hint.users', 'Team members will be listed here.'],
  suppliers: ['empty.hint.suppliers', 'Add a supplier to start recording purchases.'],
  customers: ['empty.hint.customers', 'Customers will be listed here after their first sale.'],
  stock: ['empty.hint.stock', 'Stock entries will appear here once inventory is received.'],
  categories: ['empty.hint.categories', 'Create a category to organise your products.'],
  purchases: ['empty.hint.purchases', 'Purchases you record will be listed here.'],
  invoices: ['empty.hint.invoices', 'Invoices are created automatically from sales.'],
  movements: ['empty.hint.movements', 'Stock changes will be logged here.'],
  search: ['empty.hint.search', 'Try a different search term or clear your filters.'],
  default: ['empty.hint.default', 'There is nothing to show here yet.'],
};

const kindPatterns: Array<[RegExp, EmptyKind]> = [
  [/filter|match|search/i, 'search'],
  [/movement|activity/i, 'movements'],
  [/invoice/i, 'invoices'],
  [/purchase/i, 'purchases'],
  [/sale/i, 'sales'],
  [/order/i, 'orders'],
  [/supplier/i, 'suppliers'],
  [/customer/i, 'customers'],
  [/user/i, 'users'],
  [/categor/i, 'categories'],
  [/stock/i, 'stock'],
  [/product/i, 'products'],
];

export function inferEmptyKind(message: string | undefined): EmptyKind {
  if (!message) {
    return 'default';
  }

  return kindPatterns.find(([re]) => re.test(message))?.[1] ?? 'default';
}

const tones: Record<EmptyKind, { ring: string; bg: string; fg: string }> = {
  sales: { ring: '#BFEBD7', bg: 'linear-gradient(135deg,#DDF6EB,#fff)', fg: '#2F7A62' },
  products: { ring: '#C8E2D8', bg: 'linear-gradient(135deg,#E1F0EA,#fff)', fg: '#428475' },
  orders: { ring: '#F2D6A0', bg: 'linear-gradient(135deg,#FFEBC8,#fff)', fg: '#B27A14' },
  users: { ring: '#C8E2D8', bg: 'linear-gradient(135deg,#E1F0EA,#fff)', fg: '#428475' },
  suppliers: { ring: '#F3DFB8', bg: 'linear-gradient(135deg,#FFF1DA,#fff)', fg: '#B27A14' },
  customers: { ring: '#BFEBD7', bg: 'linear-gradient(135deg,#DDF6EB,#fff)', fg: '#2F7A62' },
  stock: { ring: '#CBD6D1', bg: 'linear-gradient(135deg,#E3EAE7,#fff)', fg: '#1A312C' },
  categories: { ring: '#C8E2D8', bg: 'linear-gradient(135deg,#E1F0EA,#fff)', fg: '#428475' },
  purchases: { ring: '#BFEBD7', bg: 'linear-gradient(135deg,#DDF6EB,#fff)', fg: '#2F7A62' },
  invoices: { ring: '#F3DFB8', bg: 'linear-gradient(135deg,#FFF1DA,#fff)', fg: '#B27A14' },
  movements: { ring: '#CBD6D1', bg: 'linear-gradient(135deg,#E3EAE7,#fff)', fg: '#1A312C' },
  search: { ring: '#E5E7EB', bg: 'linear-gradient(135deg,#F3F4F6,#fff)', fg: '#4B5563' },
  default: { ring: '#E5E7EB', bg: 'linear-gradient(135deg,#F3F4F6,#fff)', fg: '#4B5563' },
};

interface EmptyStateProps {
  /** One-line message (existing `emptyMessage` strings). Title and hint are derived from it. */
  message?: string;
  /** Overrides the derived title. */
  title?: string;
  /** Overrides the derived description. */
  description?: string;
  /** Overrides the icon inferred from the message. */
  kind?: EmptyKind;
  action?: ReactNode;
  /** Smaller icon and spacing, for cards and dashboard panels. */
  compact?: boolean;
  /** Stretch to the parent's height and centre vertically. */
  fill?: boolean;
  className?: string;
}

/**
 * Centred empty state: icon badge, title and a short description that match the
 * card or table it sits in ("No sales", "No products", ...).
 */
export default function EmptyState({
  message,
  title,
  description,
  kind,
  action,
  compact = false,
  fill = false,
  className,
}: EmptyStateProps) {
  const { t } = useT();
  const resolvedKind = kind ?? inferEmptyKind(message ?? title);
  const tone = tones[resolvedKind];

  let heading = title;
  let body = description;

  if (!heading && message) {
    // "No orders yet. Checkout from your cart." -> title + description.
    const match = message.match(/^(.+?[.!?])\s+(.+)$/);

    heading = (match ? match[1] : message).replace(/[.]$/, '');
    body ??= match?.[2];
  }

  heading ??= t('table.noRecords', 'No records found');
  body ??= t(...hints[resolvedKind]);

  const size = compact ? 'size-12' : 'size-16';
  const glyph = compact ? 'size-6' : 'size-8';

  return (
    <div
      role="status"
      className={cn(
        'flex w-full flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-6' : 'gap-3 px-4 py-10',
        fill && 'h-full min-h-[200px] flex-1',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('relative grid place-items-center rounded-full shadow-sm ring-1', size)}
        style={{ background: tone.bg, boxShadow: `0 0 0 6px ${tone.ring}33`, ['--tw-ring-color' as string]: tone.ring }}
      >
        <svg
          viewBox="0 0 24 24"
          className={glyph}
          fill="none"
          stroke={tone.fg}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icons[resolvedKind]}
        </svg>
      </span>
      <p className={cn('font-semibold text-[#1A312C]', compact ? 'text-sm' : 'text-base')}>{heading}</p>
      <p className="max-w-xs text-xs leading-relaxed text-gray-600 sm:text-sm">{body}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
