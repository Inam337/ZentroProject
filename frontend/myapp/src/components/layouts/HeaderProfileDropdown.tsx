import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppConstants } from '@/common/AppConstants';
import { ChevronDown, KeyRound, LogOut } from '@/components/icons/FluentIcons';
import { useDismiss } from '@/hooks/use-dismiss';
import { useT } from '@/hooks/use-t';
import { cn } from '@/libs/utils';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  return parts.map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ initials, size }: { initials: string; size: 'sm' | 'lg' }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        size === 'sm' ? 'size-8 text-xs' : 'size-12 text-base',
      )}
      style={{ background: 'linear-gradient(135deg,#428475 0%,#1A312C 100%)' }}
    >
      {initials}
    </span>
  );
}

export default function HeaderProfileDropdown() {
  const { t } = useT();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useDismiss(ref, open, close);

  if (!user) {
    return null;
  }

  const initials = getInitials(user.name);
  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    close();
    logout();
    useCartStore.getState().reset();
    navigate(AppConstants.Routes.Public.Login, { replace: true });
  };

  const go = (to: string) => {
    close();
    navigate(to);
  };

  const itemClass = 'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors';

  return (
    <div
      ref={ref}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('header.profile.menu', 'Account menu')}
        className={cn(
          'flex h-10 items-center gap-2 rounded-full border border-[#D9E7E1] bg-white/80 py-1 pl-1 pr-3',
          'transition-colors hover:bg-[#E1F0EA]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#428475]',
        )}
      >
        <Avatar initials={initials} size="sm" />
        <span className="hidden min-w-0 text-left leading-tight md:block">
          <span className="block max-w-[120px] truncate text-sm font-semibold text-[#1A312C]">{user.name}</span>
          <span className="block text-[11px] capitalize text-gray-600">{user.role}</span>
        </span>
        <ChevronDown className={cn('size-4 text-gray-600 transition-transform', open && 'rotate-180')} />
      </button>

      {open
        ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[#D9E7E1] bg-white shadow-lg"
            >
              <div
                className="flex items-center gap-3 px-4 py-4"
                style={{ background: 'linear-gradient(135deg,#E1F0EA 0%,#FFFFFF 90%)' }}
              >
                <Avatar initials={initials} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1A312C]">{user.name}</p>
                  <p className="truncate text-sm text-gray-600">{user.email}</p>
                  <span
                    className={cn(
                      'mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize',
                      isAdmin ? 'bg-[#1A312C] text-white' : 'bg-[#DDF6EB] text-[#1A312C]',
                    )}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => go(AppConstants.Routes.Private.Profile)}
                  className={cn(itemClass, 'text-gray-800 hover:bg-[#F3F8F6]')}
                >
                  <KeyRound className="size-4 text-[#428475]" />
                  {t('header.profile.changePassword', 'Change Password')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => go(AppConstants.Routes.Private.Orders)}
                  className={cn(itemClass, 'text-gray-800 hover:bg-[#F3F8F6]')}
                >
                  <span aria-hidden="true" className="w-4 text-center text-[#428475]">▤</span>
                  {t('menu.ordersList', 'Order list')}
                </button>
              </div>

              <div className="border-t border-gray-100 py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className={cn(itemClass, 'text-red-700 hover:bg-red-50')}
                >
                  <LogOut className="size-4" />
                  {t('menu.logout', 'Log out')}
                </button>
              </div>
            </div>
          )
        : null}
    </div>
  );
}
