import type { MenuItem } from '@/common/MenuData';

/** Returns menu items as-is (Zentro: no role-based filtering yet). */
export function useFilteredMenu(menuItems: MenuItem[]): MenuItem[] {
  return menuItems;
}
