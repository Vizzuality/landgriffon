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
    <Menu as="div" className="flex justify-center flex-col items-center w-full mb-5">
      {(!user || status === 'loading') && <Loading className="w-5 h-5 text-white" />}
      {user && status === 'success' && (
        <>
          <Menu.Button
            className="focus-visible:shadow-button-focused focus-visible:outline-none rounded-lg shadow-menu hover:shadow-button-hovered"
            ref={refs.setReference}
          >
            <UserAvatar
              userFullName={userName}
              user={user}
              className="bg-black/20 h-[50px] w-[50px] "
            />
          </Menu.Button>
          <span className="text-white text-xs mt-3">Account</span>
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
            className="z-40 p-6 bg-white rounded-md shadow-lg focus:outline-none"
          >
            <div className="flex mb-3 items-center">
              <UserAvatar userFullName={userName} user={user} className="w-14 h-14" />

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
