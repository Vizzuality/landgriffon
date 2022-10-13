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
  USERS: {
    name: 'Users',
    href: '/data/users',
  },
};
