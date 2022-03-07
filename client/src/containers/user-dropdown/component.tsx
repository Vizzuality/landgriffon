import { Fragment, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Popover, Transition } from '@headlessui/react';
import StringAvatar from 'containers/string-avatar';
import Avatar from 'components/avatar';
import Loading from 'components/loading';

const MENU_ITEM_CLASSNAME =
  'block w-full py-2 px-4 text-sm text-left text-gray-900 h-9 hover:bg-green-50';

const UserDropdown: React.FC = () => {
  const handleSignOut = useCallback(() => signOut(), []);
  const { data: session, status } = useSession();

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
        <Popover.Button>{renderAvatar()}</Popover.Button>
      </div>

      {session && (
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel className="absolute p-6 bg-white rounded-md shadow-lg bottom-5 left-24 focus:outline-none">
            <div className="flex mb-3">
              {renderAvatar('w-14 h-14')}

              <div className="ml-4">
                <span className="block text-lg leading-8 text-gray-900">{session.user.name}</span>
                <span className="block text-sm leading-7 text-gray-400">{session.user.email}</span>
              </div>
            </div>

            <div>
              <a href="./profile" className={MENU_ITEM_CLASSNAME}>
                Edit Profile
              </a>
            </div>

            <div>
              <button type="button" onClick={handleSignOut} className={MENU_ITEM_CLASSNAME}>
                Logout
              </button>
            </div>
          </Popover.Panel>
        </Transition>
      )}
    </Popover>
  );
};

export default UserDropdown;
