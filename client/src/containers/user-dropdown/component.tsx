import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { signOut, useSession } from 'next-auth/react';
import { Popover } from '@headlessui/react';
import { usePopper } from 'react-popper';
import StringAvatar from 'containers/string-avatar';
import Avatar from 'components/avatar';
import Loading from 'components/loading';

const MENU_ITEM_CLASSNAME =
  'block w-full py-2 px-4 text-sm text-left text-gray-900 h-9 hover:bg-green-50';

const UserDropdown: React.FC = () => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top-end',
    strategy: 'fixed',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [20, 10],
        },
      },
    ],
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
        <Popover.Button ref={setReferenceElement}>{renderAvatar()}</Popover.Button>
      </div>
      {session &&
        createPortal(
          <Popover.Panel
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
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
              <a href="#" className={MENU_ITEM_CLASSNAME}>
                Edit Profile
              </a>
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
