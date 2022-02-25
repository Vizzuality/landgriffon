import { Menu } from '@headlessui/react';
import Avatar from 'components/avatar';
import { signOut } from 'next-auth/client';

const user = {
  name: 'Emily Selman',
  imageUrl: '/images/emily-selman.jpeg',
};

const Dropdown = () => {
  const handleSignOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    signOut();
  };

  return (
    <Menu as="div">
      <Menu.Button as="div" className="flex pb-5">
        <div className="flex justify-center w-full">
          <Avatar src={user.imageUrl} />

          <Menu.Items className="absolute flex-col h-48 p-6 bg-white rounded-md bottom-5 w-80 left-24">
            <Menu.Item as="div" className="flex">
              <Avatar src={user.imageUrl} className="cursor-pointer w-14 h-14" />

              <div className="ml-4">
                <h1 className="text-lg leading-8 text-gray-900">Nancy Greene</h1>
                <p className="text-sm leading-7 text-gray-400">nancygreene@gmail.com</p>
              </div>
            </Menu.Item>
            <Menu.Item
              as="div"
              className="w-64 py-2 pl-4 mt-3 text-sm text-gray-900 cursor-pointer h-9 hover:bg-green-50"
            >
              <a>Edit Profile</a>
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
