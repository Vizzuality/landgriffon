import { useCallback } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { signOut, useSession } from 'next-auth/react';
import { Menu } from '@headlessui/react';
import { offset, useFloating } from '@floating-ui/react-dom';
import { shift } from '@floating-ui/core';

import StringAvatar from 'components/string-avatar';
import Avatar from 'components/avatar';
import Loading from 'components/loading';

const MENU_ITEM_CLASSNAME =
  'block w-full py-2 px-4 text-sm text-left text-gray-900 h-9 hover:bg-navy-50 focus-visible:outline-navy-50';

const UserDropdown: React.FC = () => {
  const { x, y, reference, floating, strategy } = useFloating({
    placement: 'top-start',
    middleware: [offset({ crossAxis: 20, mainAxis: 10 }), shift()],
  });

  const { data: session, status } = useSession(); // TO-DO: replace by useMe

  const handleSignOut = useCallback(() => signOut({ callbackUrl: '/auth/signin' }), []);

  const renderAvatar = useCallback(
    (className?: string) => {
      if (!session) return null;
      const { user } = session || {};
      if (user?.image) return <Avatar alt="user avatar" src={user?.image} className={className} />;
      if (user?.name) return <StringAvatar fullName={user.name} className={className} />;
      return <StringAvatar fullName={user.email} className={className} />;
    },
    [session],
  );

  return (
    <Menu as="div" className="flex justify-center w-full mb-5">
      {(!session || status === 'loading') && <Loading className="w-5 h-5 text-white" />}
      <Menu.Button
        className="rounded-full focus:outline-none focus-visible:outline-1 focus-visible:outline-white"
        ref={reference}
      >
        {renderAvatar('bg-black/20')}
      </Menu.Button>
      {!!session &&
        createPortal(
          <Menu.Items
            ref={floating}
            style={{
              position: strategy,
              top: y ?? '',
              left: x ?? '',
            }}
            className="z-40 p-6 bg-white rounded-md shadow-lg focus:outline-none"
          >
            <div className="flex mb-3 items-center">
              {renderAvatar('w-14 h-14')}

              <div className="ml-4">
                <span className="block text-lg leading-8 text-gray-900">{session?.user.name}</span>
                <span className="block text-sm leading-7 text-gray-400">{session?.user.email}</span>
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
          </Menu.Items>,
          document.body,
        )}
    </Menu>
  );
};

export default UserDropdown;
