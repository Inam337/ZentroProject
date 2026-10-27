import { Link } from 'react-router-dom';

import { AppConstants } from '@/common/AppConstants';
import AdminDashboardPanel from '@/components/admin/AdminDashboardPanel';
import {
  ArrowRight,
  ClipboardList,
  Package,
  Settings,
  ShoppingCart,
  Warehouse,
} from '@/components/icons/FluentIcons';
import PanelErrorBoundary from '@/components/ui/PanelErrorBoundary';
import TintedCard, { type Accent } from '@/components/ui/TintedCard';
import { useT } from '@/hooks/use-t';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuthStore } from '@/stores/auth';

interface Shortcut {
  titleKey: string;
  title: string;
  descriptionKey: string;
  description: string;
  to: string;
  icon: typeof Package;
  accent: Accent;
}

const quickLinks: Shortcut[] = [
  {
    titleKey: 'menu.products',
    title: 'Products',
    descriptionKey: 'commerce.dashboard.productsHint',
    description: 'Browse the catalog and add items to your cart.',
    to: AppConstants.Routes.Private.Products,
    icon: Package,
    accent: 'teal',
  },
  {
    titleKey: 'menu.cart',
    title: 'Cart',
    descriptionKey: 'commerce.dashboard.cartHint',
    description: 'Review quantities and proceed to checkout.',
    to: AppConstants.Routes.Private.Cart,
    icon: ShoppingCart,
    accent: 'mint',
  },
  {
    titleKey: 'menu.ordersList',
    title: 'Order list',
    descriptionKey: 'commerce.dashboard.ordersHint',
    description: 'Track order status and complete payment.',
    to: AppConstants.Routes.Private.Orders,
    icon: ClipboardList,
    accent: 'sand',
  },
];

const adminLinks: Shortcut[] = [
  {
    titleKey: 'menu.adminProducts',
    title: 'Manage products',
    descriptionKey: 'admin.dashboard.productsHint',
    description: 'Create and edit catalog products.',
    to: AppConstants.Routes.Private.Admin.Products,
    icon: Settings,
    accent: 'teal',
  },
  {
    titleKey: 'menu.adminInventory',
    title: 'Inventory & alerts',
    descriptionKey: 'admin.dashboard.inventoryHint',
    description: 'Stock levels, write-offs and movement history.',
    to: AppConstants.Routes.Private.Admin.Inventory,
    icon: Warehouse,
    accent: 'mint',
  },
  {
    titleKey: 'menu.adminPurchases',
    title: 'Purchases',
    descriptionKey: 'admin.dashboard.purchasesHint',
    description: 'Record supplier purchases.',
    to: AppConstants.Routes.Private.Admin.Purchases,
    icon: ClipboardList,
    accent: 'sand',
  },
  {
    titleKey: 'menu.adminInvoices',
    title: 'Invoices',
    descriptionKey: 'admin.dashboard.invoicesHint',
    description: 'Browse, print and cancel sales invoices.',
    to: AppConstants.Routes.Private.Admin.Invoices,
    icon: ClipboardList,
    accent: 'slate',
  },
];

const chipBg: Record<Accent, string> = {
  teal: '#428475',
  mint: '#2F9E76',
  sand: '#B98530',
  amber: '#B87A12',
  rose: '#C0392B',
  slate: '#1A312C',
};

function ShortcutCard({ item }: { item: Shortcut }) {
  const { t } = useT();
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#428475] focus-visible:ring-offset-2"
    >
      <TintedCard
        accent={item.accent}
        className="h-full p-5 transition-shadow group-hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="rounded-lg p-2 text-white"
            style={{ background: chipBg[item.accent] }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <ArrowRight className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-x-0.5" />
        </div>
        <h3 className="mt-3 font-semibold text-[#1A312C]">{t(item.titleKey, item.title)}</h3>
        <p className="mt-1 text-sm text-gray-600">{t(item.descriptionKey, item.description)}</p>
      </TintedCard>
    </Link>
  );
}

export default function Dashboard() {
  const { t, locale } = useT();
  const isAdmin = useIsAdmin();
  const user = useAuthStore(state => state.user);

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t('dashboard.goodMorning', 'Good morning')
    : hour < 18 ? t('dashboard.goodAfternoon', 'Good afternoon') : t('dashboard.goodEvening', 'Good evening');
  const today = new Intl.DateTimeFormat(locale === 'ur' ? 'ur-PK' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="w-full space-y-6">
      {/* ---- welcome banner ---- */}
      <section
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-md sm:p-8"
        style={{ background: 'linear-gradient(120deg,#1A312C 0%,#2B5A4E 55%,#428475 100%)' }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-[#89D7B7]/25"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-24 size-48 rounded-full bg-[#FFF4E1]/15"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-[#CDEFE0]">{today}</p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
              {firstName ? `${greeting}, ${firstName}` : greeting}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#E4F5EE]">
              {isAdmin
                ? t('dashboard.adminSubtitle', 'Here is how your stock and sales look today.')
                : t('pages.dashboard.welcome', 'Welcome back. Use the sidebar to navigate.')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={AppConstants.Routes.Private.Products}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#1A312C] transition-colors hover:bg-[#FFF4E1]"
            >
              {t('dashboard.browse', 'Browse products')}
            </Link>
            {isAdmin
              ? (
                  <Link
                    to={AppConstants.Routes.Private.Admin.Sales}
                    className="rounded-md border border-white/60 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    {t('dashboard.recordSale', 'Record a sale')}
                  </Link>
                )
              : null}
          </div>
        </div>
      </section>

      {/* ---- shopper shortcuts ---- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(link => (
          <ShortcutCard
            key={link.to}
            item={link}
          />
        ))}
      </div>

      {isAdmin
        ? (
            <>
              <PanelErrorBoundary label="Inventory overview">
                <AdminDashboardPanel />
              </PanelErrorBoundary>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('admin.dashboard.title', 'Admin tools')}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {adminLinks.map(link => (
                    <ShortcutCard
                      key={link.to}
                      item={link}
                    />
                  ))}
                </div>
              </div>
            </>
          )
        : null}
    </div>
  );
}
