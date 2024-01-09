import { useCallback } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Menu } from '@headlessui/react';
import { offset, useFloating } from '@floating-ui/react-dom';
import { shift } from '@floating-ui/core';
import { FloatingPortal } from '@floating-ui/react';

import Loading from 'components/loading';
import UserAvatar from 'containers/user-avatar';
import { useProfile } from 'hooks/profile';
import getUserFullName from 'utils/user-full-name';

const MENU_ITEM_CLASSNAME =
  'block w-full py-2 px-4 text-sm text-left text-gray-900 h-9 hover:bg-navy-50 focus-visible:outline-navy-50';

const UserDropdown: React.FC = () => {
  const { x, y, refs, strategy } = useFloating({
    placement: 'top-start',
    middleware: [offset({ crossAxis: 20, mainAxis: 10 }), shift()],
  });

  const { data: user, status } = useProfile();

  const handleSignOut = useCallback(() => signOut({ callbackUrl: '/auth/signin' }), []);

  const userName = getUserFullName(user, {
    replaceByEmail: true,
  });

  return (
    <Menu as="div" className="mb-5 flex w-full flex-col items-center justify-center">
      {(!user || status === 'loading') && <Loading className="h-5 w-5 text-white" />}
      {user && status === 'success' && (
        <>
          <Menu.Button
            className="rounded-lg shadow-menu hover:shadow-button-hovered focus-visible:shadow-button-focused focus-visible:outline-none"
            ref={refs.setReference}
          >
            <UserAvatar
              userFullName={userName}
              user={user}
              className="h-[50px] w-[50px] bg-black/20 "
            />
          </Menu.Button>
          <span className="mt-3 text-xs text-white">Account</span>
        </>
      )}
      {!!user && (
        <FloatingPortal>
          <Menu.Items
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? '',
              left: x ?? '',
            }}
            className="z-40 rounded-md bg-white p-6 shadow-lg focus:outline-none"
          >
            <div className="mb-3 flex items-center">
              <UserAvatar userFullName={userName} user={user} className="h-14 w-14" />

              <div className="ml-4">
                <span className="block text-lg leading-8 text-gray-900">{userName}</span>
                <span className="block text-sm leading-7 text-gray-400">{user.email}</span>
              </div>
            </div>

            <Menu.Item>
              <Link href="/profile" className={MENU_ITEM_CLASSNAME}>
                Edit Profile
              </Link>
            </Menu.Item>

            <Menu.Item>
              <button type="button" onClick={handleSignOut} className={MENU_ITEM_CLASSNAME}>
                Logout
              </button>
            </Menu.Item>
          </Menu.Items>
        </FloatingPortal>
      )}
    </Menu>
  );
};

export default UserDropdown;
