import { Menu } from '@headlessui/react';
import Avatar from 'components/avatar';
import StringAvatar from 'containers/string-avatar';
import { signOut, useSession } from 'next-auth/react';

/* const user = {
  name: 'emily selman',
  imageUrl: '/images/emily-selman.jpeg',
  imageUrl: null,
  email: 'nancygreene@gmail.com',
}; */

const Dropdown = () => {
  const handleSignOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    signOut();
  };

  const [session, loading] = useSession();

  return (
    <Menu as="div">
      <Menu.Button as="div" className="flex pb-5">
        <div className="flex justify-center w-full">
          {session.picture ? (
            <Avatar src={session.picture} className="cursor-pointer" />
          ) : (
            <StringAvatar fullName={session.name} className="cursor-pointer" />
          )}

          <Menu.Items className="absolute flex-col h-48 p-6 bg-white rounded-md bottom-5 w-80 left-24">
            <Menu.Item as="div" className="flex">
              {session.picture ? (
                <Avatar src={session.imageUrl} className="cursor-pointer w-14 h-14" />
              ) : (
                <StringAvatar fullName={session.name} className="w-14 h-14" />
              )}

              <div className="ml-4">
                <h1 className="text-lg leading-8 text-gray-900">{session.name}</h1>
                <p className="text-sm leading-7 text-gray-400">{session.email}</p>
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
        </div>
      </Menu.Button>
    </Menu>
  );
};

export default Dropdown;
