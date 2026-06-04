import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Menu } from 'lucide-react';

import { AppConstants } from '@/common/AppConstants';
import { AppSidebar } from '@/components/layouts/AppSidebar';
import HeaderProfileDropdown from '@/components/layouts/HeaderProfileDropdown';
import { SidebarLayoutProvider, useSidebarLayout } from '@/components/layouts/sidebar-layout-context';

interface MainLayoutProps {
  children: ReactNode;
  headerTitle?: string;
}

const routeTitleKeys: Record<string, string> = {
  [AppConstants.Routes.Private.Dashboard]: 'menu.dashboard',
  [AppConstants.Routes.Private.Profile]: 'menu.profile',
};

function MainLayoutContent({
  children,
  headerTitle,
}: MainLayoutProps) {
  const location = useLocation();
  const intl = useIntl();
  const { isMobile, setMobileOpen } = useSidebarLayout();
  const titleKey = routeTitleKeys[location.pathname];
  const pageTitle = headerTitle
    ?? (titleKey
      ? intl.formatMessage({ id: titleKey, defaultMessage: titleKey })
      : intl.formatMessage({ id: 'app.title', defaultMessage: 'Zentro' }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={[
            'sticky top-0 z-30 flex items-center justify-between gap-4 h-15',
            'border-b border-gray-200 bg-white px-2 py-2 sm:px-4',
          ].join(' ')}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 ">
            {isMobile
              ? (
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="rounded-md border border-gray-200 p-2 hover:bg-gray-50"
                    aria-label={intl.formatMessage({
                      id: 'sidebar.open',
                      defaultMessage: 'Open menu',
                    })}
                  >
                    <Menu className="h-5 w-5 text-gray-700" />
                  </button>
                )
              : null}
            <h1 className="truncate text-lg font-semibold text-gray-900">{pageTitle}</h1>
          </div>
          <HeaderProfileDropdown />
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function MainLayout(props: MainLayoutProps) {
  return (
    <SidebarLayoutProvider>
      <MainLayoutContent {...props} />
    </SidebarLayoutProvider>
  );
}
