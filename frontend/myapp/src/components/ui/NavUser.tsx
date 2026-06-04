import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { useSidebar } from '@/components/ui/Sidebar';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/Sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useAuthStore } from '@/stores/authStore';
import { useRolePermissionStore } from '@/stores/rolePermissionStore';
import { AppConstants } from '@/common/AppConstants';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/libs/utils';
import { RbIcon } from '../icons/common/RbIcon';
import { IconColors } from '@/components/icons/types/RbIcon.types';

export function NavUser() {
  const { t } = useTranslation();
  const { state, isMobile } = useSidebar();
  const { logout, userEmail, userName, fetchUserAttributes } = useAuthStore();
  const { resetUserPermissionsFetch } = useRolePermissionStore();
  const navigate = useNavigate();
  const isMobileDevice = useIsMobile();
  const isCollapsed = state === 'collapsed';
  const ICON_SIZE = 16;

  // Fetch user attributes from Cognito on component mount
  useEffect(() => {
    // Only fetch if we don't have user data yet
    if (!userEmail) {
      fetchUserAttributes();
    }
  }, [userEmail, fetchUserAttributes]);

  const handleLogout = async () => {
    await logout(); // Clear token first to prevent any permission fetches
    resetUserPermissionsFetch(); // Reset permissions fetch flag to allow re-fetching on next login
    navigate(AppConstants.Routes.Public.Login);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={isCollapsed ? (userEmail || 'Loading...') : undefined}
              size="lg"
              className={cn(
                'w-full data-[state=open]:bg-sidebar-accent',
                'data-[state=open]:text-sidebar-accent-foreground',
                isCollapsed && 'justify-center',
              )}
            >
              <Avatar className={cn('h-9 w-9 rounded-full overflow-hidden border border-gray-100', isCollapsed && 'mx-auto')}>
                {localStorage.getItem('profileImageUrl') != ''
                  ? (
                      <AvatarImage
                        src={localStorage.getItem('profileImageUrl')}
                        alt="Profile"
                        className="object-cover"
                      />
                    )
                  : (
                      <AvatarFallback className="bg-blue-600 text-white">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </AvatarFallback>
                    )}

              </Avatar>
              {!isCollapsed && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-normal text-white">
                    {
                      localStorage.getItem('fullName') != ''
                        ? localStorage.getItem('fullName')
                        : userName || 'User'
                    }
                  </span>
                  <span className="truncate text-xs text-white/80 ">{userEmail || 'Loading...'}</span>
                </div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile || isMobileDevice ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Avatar className="h-8 w-8">
                  {localStorage.getItem('profileImageUrl') != ''
                    ? (
                        <AvatarImage
                          src={localStorage.getItem('profileImageUrl')}
                          alt="Profile"
                          className="object-cover"
                        />
                      )
                    : (
                        <AvatarFallback className="bg-blue-600 text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </AvatarFallback>
                      )}
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight">
                  <span className="truncate font-semibold">
                    { localStorage.getItem('fullName') != ''
                      ? localStorage.getItem('fullName')
                      : userName || 'User'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{userEmail || 'Loading...'}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />

            <DropdownMenuItem onClick={() => navigate(AppConstants.Routes.Private.Settings)}>
              <RbIcon
                name="settings"
                size={ICON_SIZE}
                color={IconColors.GRAY_COLOR_ICON}
              />
              <span>{t('pages.settings.title')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              variant="destructive"
            >
              <RbIcon
                name="logout"
                size={ICON_SIZE}
                color={IconColors.GRAY_COLOR_ICON}
              />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
