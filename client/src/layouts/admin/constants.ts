import type { TabsType } from 'components/tabs';

export const ADMIN_TABS: TabsType = {
  DATA: {
    name: 'Actual data',
    href: '/data',
  },
  SCENARIOS: {
    name: 'Scenarios',
    href: '/data/scenarios',
  },
  TARGETS: {
    name: 'Targets',
    href: '/data/targets',
  },
};

export const MENU_ITEM_STYLE = 'flex items-center pb-4 -mb-[2px]';
export const MENU_ITEM_ACTIVE_STYLE = 'text-navy-400 border-b-2 border-navy-400 px-1';
export const MENU_ITEM_DISABLED_STYLE = 'text-gray-300';
