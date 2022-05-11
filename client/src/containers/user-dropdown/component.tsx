import { useCallback } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { signOut, useSession } from 'next-auth/react';
import { Popover } from '@headlessui/react';
import StringAvatar from 'containers/string-avatar';
import Avatar from 'components/avatar';
import Loading from 'components/loading';
import { offset, useFloating } from '@floating-ui/react-dom';
import { shift } from '@floating-ui/core';

const MENU_ITEM_CLASSNAME =
  'block w-full py-2 px-4 text-sm text-left text-gray-900 h-9 hover:bg-green-50';

const UserDropdown: React.FC = () => {
  const { x, y, reference, floating, strategy } = useFloating({
    placement: 'top-start',
    middleware: [offset({ crossAxis: 20, mainAxis: 10 }), shift()],
  });

  const { data: session, status } = useSession(); // TO-DO: replace by useMe

  const handleSignOut = useCallback(() => signOut(), []);

  const renderAvatar = useCallback(
    (className?: string) => {
      if (!session) return null;
      const { user } = session || {};
      if (user?.image) return <Avatar src={user?.image} className={className} />;
      if (user?.name) return <StringAvatar fullName={user.name} className={className} />;
      return <StringAvatar fullName={user.email} className={className} />;
    },
    [session],
  );

  return (
    <Popover as="div" className="flex justify-center w-full mb-5">
      <div>
        {(!session || status === 'loading') && <Loading className="text-white" />}
        <Popover.Button ref={reference}>{renderAvatar()}</Popover.Button>
      </div>
      {session &&
        createPortal(
          <Popover.Panel
            ref={floating}
            style={{
              position: strategy,
              top: y ?? '',
              left: x ?? '',
            }}
            className="p-6 bg-white shadow-lg rounded-md focus:outline-none z-40"
          >
            <div className="flex mb-3">
              {renderAvatar('w-14 h-14')}

              <div className="ml-4">
                <span className="block text-lg leading-8 text-gray-900">{session.user.name}</span>
                <span className="block text-sm leading-7 text-gray-400">{session.user.email}</span>
              </div>
            </div>

            <div>
              <Link href="/profile">
                <a className={MENU_ITEM_CLASSNAME}>Edit Profile</a>
              </Link>
            </div>

            <div>
              <button type="button" onClick={handleSignOut} className={MENU_ITEM_CLASSNAME}>
                Logout
              </button>
            </div>
          </Popover.Panel>,
          document.body,
        )}
    </Popover>
  );
};

export default UserDropdown;
