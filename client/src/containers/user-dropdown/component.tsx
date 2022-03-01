import { useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Menu } from '@headlessui/react';
import StringAvatar from 'containers/string-avatar';
import Avatar from 'components/avatar';
import Loading from 'components/loading';

const UserDropdown: React.FC = () => {
  const handleSignOut = useCallback(() => signOut(), []);
  const { data: session, status } = useSession();

  const renderAvatar = useCallback(() => {
    if (!session) return null;
    const { user } = session || {};
    if (user?.image) return <Avatar src={user?.image} className="cursor-pointer" />;
    if (user?.name) return <StringAvatar fullName={user.name} className="cursor-pointer" />;
    return <StringAvatar fullName={user.email} className="cursor-pointer" />;
  }, [session]);

  return (
    <Menu as="div">
      <Menu.Button as="div" className="flex pb-5">
        <div className="flex justify-center w-full">
          {(!session || status === 'loading') && <Loading className="text-white" />}

          {renderAvatar()}

          {session && (
            <Menu.Items className="absolute flex-col h-48 p-6 bg-white rounded-md bottom-5 w-80 left-24">
              <Menu.Item as="div" className="flex">
                {session.user.image ? (
                  <Avatar src={session.user.image} className="cursor-pointer w-14 h-14" />
                ) : (
                  <StringAvatar fullName={session.user.name} className="w-14 h-14" />
                )}

                <div className="ml-4">
                  <h1 className="text-lg leading-8 text-gray-900">{session.user.name}</h1>
                  <p className="text-sm leading-7 text-gray-400">{session.user.email}</p>
                </div>
              </Menu.Item>

              <Menu.Item
                as="div"
                className="w-64 py-2 pl-4 mt-3 text-sm text-gray-900 cursor-pointer h-9 hover:bg-green-50"
              >
                <a href="#">Edit Profile</a>
              </Menu.Item>

              <Menu.Item
                as="div"
                className="w-64 py-2 pl-4 text-sm text-gray-900 cursor-pointer h-9 hover:bg-green-50"
              >
                <button onClick={handleSignOut}>Logout</button>
              </Menu.Item>
            </Menu.Items>
          )}
        </div>
      </Menu.Button>
    </Menu>
  );
};

export default UserDropdown;
