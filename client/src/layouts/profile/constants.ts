import { RoleName } from 'hooks/permissions/enums';

import type { TabsType } from 'components/tabs';

export const USER_TABS: TabsType = {
  PROFILE: {
    name: 'Profile',
    href: '/profile',
  },
  USERS: {
    name: 'Users',
    href: '/profile/users',
    restrictedToRoles: [RoleName.ADMIN],
  },
};
