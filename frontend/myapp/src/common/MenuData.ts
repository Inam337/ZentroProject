import { IconColors } from '@/components/icons/types/RbIcon.types';
import type { IconKey } from '@/components/icons/config/icons.registry';
import { AppConstants } from '@/common/AppConstants';

export interface MenuSubItem {
  title: string;
  url: string;
}

export interface MenuItem {
  title: string;
  url: string;
  icon: IconKey;
  iconWidth?: number;
  iconHeight?: number;
  iconFill?: string;
  items?: MenuSubItem[];
}

export interface MenuData {
  navMain: MenuItem[];
}

const iconWidth = 16;
const iconHeight = 16;
const iconFill = IconColors.WHITE_COLOR_ICON;

export const menuData: MenuData = {
  navMain: [
    {
      title: 'menu.dashboard',
      url: AppConstants.Routes.Private.Dashboard,
      icon: 'home',
      iconWidth,
      iconHeight,
      iconFill,
    },
    {
      title: 'menu.catalog',
      url: '/catalog',
      icon: 'categories',
      iconWidth,
      iconHeight,
      iconFill,
      items: [
        {
          title: 'menu.products',
          url: '/products',
        },
        {
          title: 'menu.categories',
          url: '/categories',
        },
        {
          title: 'menu.cart',
          url: '/cart',
        },
      ],
    },
    {
      title: 'menu.orders',
      url: '/orders',
      icon: 'barChart',
      iconWidth,
      iconHeight,
      iconFill,
      items: [
        {
          title: 'menu.ordersList',
          url: '/orders',
        },
        {
          title: 'menu.checkout',
          url: '/checkout',
        },
      ],
    },
    {
      title: 'menu.account',
      url: AppConstants.Routes.Private.Profile,
      icon: 'user',
      iconWidth,
      iconHeight,
      iconFill,
      items: [
        {
          title: 'menu.profile',
          url: AppConstants.Routes.Private.Profile,
        },
      ],
    },
  ],
};
