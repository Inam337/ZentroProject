'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import { AUTH_ROUTES } from '@/common/app-constants';
import { Avatar } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/libs/utils';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  SupportedLocale,
} from '@/components/language/language-switcher';
import { CommonIcon } from '@/components/icons/common-icons';
import { CommonIconNames, IconColors } from '@/components/icons/types';
import { useNavUserProfile } from '@/hooks/use-nav-user-profile';
import { DEFAULT_PROFILE_IMAGE } from '@/models/profile';

interface NavUserProps {
  direction?: 'rtl' | 'ltr';
  locale?: SupportedLocale;
  onLocaleChange?: (locale: SupportedLocale) => void;
}

export function NavUser({
  direction = 'ltr',
}: NavUserProps) {
  const router = useRouter();
  const AVATAR_ICON_SIZE = 24;
  const intl = useIntl();
  const MOB_AVATAR_ICON_SIZE = 32;
  const COG_ICON_SIZE = 16;
  const { isMobile, state } = useSidebar();
  const isRtl = direction === 'rtl';
  const isCollapsed = state === 'collapsed';
  const authLogout = intl.formatMessage({ id: 'settings.text.logout' });
  const authSettings = intl.formatMessage({ id: 'settings.text.settings' });
  // Get profile data from the custom hook
  const { name, email, avatar, isLoading } = useNavUserProfile();
  const displayName = isLoading ? 'Loading...' : name; // Show loading state
  const handleLogout = async () => {
    console.error('🔄 User initiated logout from nav-user component');

    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to login page
        router.push(AUTH_ROUTES.LOGIN);
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return (
    <SidebarMenu>
      {/* Language switcher hidden - English is default */}
      {/* {onLocaleChange && isMobileDevice && !isCollapsed && (
        <SidebarMenuItem>
          <LanguageSwitcher
            currentLocale={locale}
            onLocaleChange={onLocaleChange}
          />
        </SidebarMenuItem>
      )} */}
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={isCollapsed ? displayName : undefined}
              size={isCollapsed ? 'default' : 'lg'}
              className={cn(
                `data-[state=open]:bg-sidebar-accent  cursor-pointer
                data-[state=open]:text-sidebar-accent-foreground w-full`,
                isRtl ? 'flex-row-reverse text-right' : '',
                isCollapsed && 'justify-center',
              )}
            >
              <Avatar
                className={cn(
                  'flex items-center justify-center rounded-sm overflow-hidden',
                  isRtl && !isCollapsed ? 'ml-2 h-6 w-6' : 'h-8 w-8',
                  isCollapsed && 'mx-auto',
                )}
              >
                {avatar && avatar !== DEFAULT_PROFILE_IMAGE
                  ? (
                      <Image
                        src={avatar}
                        alt={displayName}
                        width={isCollapsed ? AVATAR_ICON_SIZE : MOB_AVATAR_ICON_SIZE}
                        height={isCollapsed ? AVATAR_ICON_SIZE : MOB_AVATAR_ICON_SIZE}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.warn('Profile image failed to load, falling back to icon');
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )
                  : (
                      <CommonIcon
                        width={isCollapsed ? AVATAR_ICON_SIZE : MOB_AVATAR_ICON_SIZE}
                        height={isCollapsed ? AVATAR_ICON_SIZE : MOB_AVATAR_ICON_SIZE}
                        name={CommonIconNames.AVATAR_ICON}
                        fill={IconColors.WHITE_COLOR_ICON}
                      />
                    )}
              </Avatar>
              <div
                className={cn(
                  'grid flex-1 text-sm leading-tight',
                  isRtl ? 'text-right' : 'text-left',
                  isCollapsed && 'hidden',
                )}
              >
                <span
                  className={cn(
                    'truncate font-semibold',
                    isRtl ? 'font-urdu' : '',
                  )}
                >
                  {displayName}
                </span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <ChevronsUpDown
                className={cn(
                  'size-4',
                  isRtl ? 'mr-auto' : 'ml-auto',
                  isCollapsed && 'hidden',
                )}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : isRtl ? 'left' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div
                className={cn(
                  'flex items-center gap-2 px-1 py-1.5 cursor-pointer',
                  isRtl ? 'flex-row-reverse text-right' : 'text-left',
                )}
              >
                <Avatar className="h-8 w-8 rounded-sm overflow-hidden">
                  {avatar && avatar !== DEFAULT_PROFILE_IMAGE
                    ? (
                        <Image
                          src={avatar}
                          alt={displayName}
                          width={MOB_AVATAR_ICON_SIZE}
                          height={MOB_AVATAR_ICON_SIZE}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.warn('Profile image failed to load in dropdown, falling back to icon');
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )
                    : (
                        <CommonIcon
                          width={MOB_AVATAR_ICON_SIZE}
                          height={MOB_AVATAR_ICON_SIZE}
                          name={CommonIconNames.AVATAR_ICON}
                          fill={IconColors.GRAY_COLOR_ICON}
                        />
                      )}
                </Avatar>
                <div
                  className={cn(
                    'grid flex-1 text-sm leading-tight',
                    isRtl ? 'text-right' : 'text-left',
                  )}
                >
                  <span
                    className={cn(
                      'truncate font-semibold',
                      isRtl ? 'font-urdu' : '',
                    )}
                  >
                    {displayName}
                  </span>
                  <span className="truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={isRtl ? 'flex-row-reverse text-right' : ''}
              onClick={() => router.push('/profile')}
            >
              <div
                className={cn(
                  'flex items-center gap-2 cursor-pointer',
                  isRtl ? 'flex-row-reverse' : '',
                )}
              >
                <CommonIcon
                  width={COG_ICON_SIZE}
                  height={COG_ICON_SIZE}
                  name={CommonIconNames.COG_ICON}
                  fill={IconColors.GRAY_COLOR_ICON}
                />
                <span className={isRtl ? 'font-urdu' : ''}>{authSettings}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={isRtl ? 'flex-row-reverse text-right' : ''}
              onClick={handleLogout}
            >
              <div
                className={cn(
                  'flex items-center gap-2 cursor-pointer',
                  isRtl ? 'flex-row-reverse' : '',
                )}
              >
                <LogOut className="h-4 w-4" />
                <span className={isRtl ? 'font-urdu' : ''}>{authLogout}</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
