import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

import { menuData } from '@/common/MenuData';
import { NestingNav } from '@/components/ui/NestingNav';
import { useSidebarLayout } from '@/components/layouts/sidebar-layout-context';
import { useFilteredMenu } from '@/hooks/useFilteredMenu';
import { cn } from '@/libs/utils';

function SidebarPanel({
  collapsed,
  onCloseMobile,
  showCloseButton,
}: {
  collapsed: boolean;
  onCloseMobile?: () => void;
  showCloseButton?: boolean;
}) {
  const intl = useIntl();
  const filteredMenuItems = useFilteredMenu(menuData.navMain);

  return (
    <>
      <div
        className={cn(
          'flex items-center border-b border-blue-700 h-15',
          collapsed ? 'justify-center px-2 py-4' : 'justify-between px-4 py-4',
        )}
      >
        {!collapsed
          ? (
              <span className="text-lg font-semibold tracking-tight">Zentro</span>
            )
          : (
              <span className="text-sm font-bold">Z</span>
            )}
        {showCloseButton
          ? (
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-md p-1 hover:bg-white/10 lg:hidden"
                aria-label={intl.formatMessage({
                  id: 'sidebar.close',
                  defaultMessage: 'Close menu',
                })}
              >
                <X className="h-5 w-5" />
              </button>
            )
          : null}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <NestingNav
          items={filteredMenuItems}
          collapsed={collapsed}
          onNavigate={onCloseMobile}
        />
      </div>
    </>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const intl = useIntl();
  const {
    collapsed,
    toggleCollapsed,
    mobileOpen,
    setMobileOpen,
    isMobile,
  } = useSidebarLayout();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const sidebarClasses = cn(
    'flex shrink-0 flex-col bg-[#00529c] text-white transition-all duration-200',
    collapsed ? 'w-16' : 'w-56',
  );

  if (isMobile) {
    return (
      <>
        {mobileOpen
          ? (
              <button
                type="button"
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                aria-label={intl.formatMessage({
                  id: 'sidebar.closeOverlay',
                  defaultMessage: 'Close menu overlay',
                })}
                onClick={() => setMobileOpen(false)}
              />
            )
          : null}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-56 flex-col shadow-xl',
            'bg-[#00529c] text-white transition-transform duration-200 lg:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <SidebarPanel
            collapsed={false}
            showCloseButton
            onCloseMobile={() => setMobileOpen(false)}
          />
        </aside>
      </>
    );
  }

  return (
    <aside className={cn(sidebarClasses, 'min-h-screen')}>
      <SidebarPanel collapsed={collapsed} />
      <div
        className={cn(
          'border-t border-blue-700 p-2',
          collapsed ? 'flex justify-center' : 'px-2',
        )}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          title={intl.formatMessage({
            id: collapsed ? 'sidebar.expand' : 'sidebar.collapse',
            defaultMessage: collapsed ? 'Expand sidebar' : 'Collapse sidebar',
          })}
          className={cn(
            'flex w-full items-center rounded-md py-2 text-sm',
            'hover:bg-white/10 transition-colors',
            collapsed ? 'justify-center px-2' : 'gap-3 px-3',
          )}
        >
          {collapsed
            ? (
                <PanelLeftOpen className="h-5 w-5 shrink-0" />
              )
            : (
                <>
                  <PanelLeftClose className="h-5 w-5 shrink-0" />
                  <span>
                    {intl.formatMessage({
                      id: 'sidebar.collapse',
                      defaultMessage: 'Collapse',
                    })}
                  </span>
                </>
              )}
        </button>
      </div>
    </aside>
  );
}
