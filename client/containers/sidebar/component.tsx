/* eslint-disable jsx-a11y/anchor-is-valid */
import { Fragment, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  ChartBarIcon, CollectionIcon, HomeIcon, XIcon,
} from '@heroicons/react/outline';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { setMenuMobileOpen } from 'store/features/ui/slice';
import MobileNavigation from 'containers/navigation/mobile';
import DesktopNavigation from 'containers/navigation/desktop';
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
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMenuMobileOpen);
  const dispatch = useAppDispatch();
  const handleOnClose = useCallback(() => {
    dispatch(setMenuMobileOpen(false));
  }, []);
  // const { isMobileMenuOpen = false, setMobileMenuOpen } = props;

  return (
    <>
      <Transition.Root show={isMobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed inset-0 flex z-40 lg:hidden"
          open={isMobileMenuOpen}
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
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white focus:outline-none">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-4">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => dispatch(setMenuMobileOpen(false))}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="pt-5 pb-4">
                <div className="flex-shrink-0 flex items-center px-4">
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/workflow-mark.svg?color=indigo&shade=600"
                    alt="Workflow"
                  />
                </div>
                <MobileNavigation items={navigationItems} />
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <a href="#" className="flex-shrink-0 group block">
                  <div className="flex items-center">
                    <div>
                      <img className="inline-block h-10 w-10 rounded-full" src={user.imageUrl} alt="" />
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">{user.name}</p>
                      <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">Account Settings</p>
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
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-20">
          <div className="flex flex-col h-0 flex-1 overflow-y-auto bg-indigo-600">
            <div className="flex-1 flex flex-col">
              <div className="flex-shrink-0 bg-indigo-700 py-4 flex items-center justify-center">
                <img
                  className="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/workflow-mark.svg?color=white"
                  alt="Workflow"
                />
              </div>
              <DesktopNavigation items={navigationItems} />
            </div>
            <div className="flex-shrink-0 flex pb-5">
              <a href="#" className="flex-shrink-0 w-full">
                <img className="block mx-auto h-10 w-10 rounded-full" src={user.imageUrl} alt="" />
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
