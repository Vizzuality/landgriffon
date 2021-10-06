/* eslint-disable jsx-a11y/anchor-is-valid */
import { Fragment, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChartBarIcon, CollectionIcon, HomeIcon, XIcon } from '@heroicons/react/outline';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { ui, setMenuMobileOpen } from 'store/features/ui';
import MobileNavigation from 'containers/navigation/mobile';
import DesktopNavigation from 'containers/navigation/desktop';
import Avatar from 'components/avatar';

import type { NavigationList } from 'containers/navigation/types';

const user = {
  name: 'Emily Selman',
  imageUrl:
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

const navigationItems: NavigationList = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Analysis', href: '/analysis', icon: ChartBarIcon },
  { name: 'Admin', href: '#', icon: CollectionIcon },
];

const Sidebar = () => {
  const { isMenuMobileOpen } = useAppSelector(ui);
  const dispatch = useAppDispatch();
  const handleOnClose = useCallback(() => {
    dispatch(setMenuMobileOpen(false));
  }, []);

  return (
    <>
      <Transition.Root show={isMenuMobileOpen} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed inset-0 flex z-40 lg:hidden"
          open={isMenuMobileOpen}
          onClose={handleOnClose}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative max-w-xs w-full bg-green-700 pt-5 pb-4 flex-1 flex flex-col">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-1 right-0 -mr-14 p-1">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => dispatch(setMenuMobileOpen(false))}
                  >
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    <span className="sr-only">Close sidebar</span>
                  </button>
                </div>
              </Transition.Child>
              <div className="pt-5 pb-4">
                <div className="flex-shrink-0 flex items-center px-4">
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/workflow-mark.svg?color=white"
                    alt="Landgriffon"
                  />
                </div>
                <MobileNavigation items={navigationItems} />
              </div>
              <div className="flex-shrink-0 flex p-4">
                <a href="#" className="flex-shrink-0 group block">
                  <div className="flex items-center">
                    <Avatar src={user.imageUrl} />
                    <div className="ml-3">
                      <p className="text-base font-medium text-white">{user.name}</p>
                      <p className="text-sm font-medium text-gray-400">Account Settings</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0 fixed h-screen w-28 z-10">
        <div className="flex flex-col w-28 bg-green-700">
          <div className="flex flex-col h-0 flex-1 overflow-y-auto">
            <div className="flex-1 flex flex-col">
              {/* Logo has been removed temporally */}
              {/* <div className="flex-shrink-0 py-4 flex items-center justify-center">
                <img
                  className="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/workflow-mark.svg?color=white"
                  alt="Landgriffon"
                />
              </div> */}
              <DesktopNavigation items={navigationItems} />
            </div>
            <div className="flex-shrink-0 flex pb-5">
              <a href="#" className="flex flex-shrink-0 w-full justify-center">
                <Avatar src={user.imageUrl} />
                <div className="sr-only">
                  <p>{user.name}</p>
                  <p>Account settings</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
