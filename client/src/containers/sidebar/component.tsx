import { Fragment, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CollectionIcon, CogIcon, XIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { ui, setMenuMobileOpen } from 'store/features/ui';
import MobileNavigation from 'containers/navigation/mobile';
import DesktopNavigation from 'containers/navigation/desktop';
import UserDropdown from 'containers/user-dropdown';
import type { NavigationList } from 'containers/navigation/types';

const navigationItems: NavigationList = [
  { name: 'Analysis', href: '/analysis', icon: CollectionIcon },
  { name: 'Admin', href: '/admin', icon: CogIcon },
  { name: 'Help', href: '#', icon: QuestionMarkCircleIcon },
];

const Sidebar: React.FC = () => {
  const { isMenuMobileOpen } = useAppSelector(ui);
  const dispatch = useAppDispatch();
  const handleOnClose = useCallback(() => {
    dispatch(setMenuMobileOpen(false));
  }, [dispatch]);

  return (
    <>
      <Transition.Root show={isMenuMobileOpen} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed inset-0 z-40 flex hidden"
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
            <div className="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 bg-primary">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute right-0 p-1 top-1 -mr-14">
                  <button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => dispatch(setMenuMobileOpen(false))}
                  >
                    <XIcon className="w-6 h-6 text-white" aria-hidden="true" />
                    <span className="sr-only">Close sidebar</span>
                  </button>
                </div>
              </Transition.Child>
              <div className="pt-5 pb-4">
                <div className="flex items-center flex-shrink-0 px-4">
                  {/* Logo has been removed temporally */}
                  {/* <img
                    className="w-auto h-8"
                    src="https://tailwindui.com/img/logos/workflow-mark.svg?color=white"
                    alt="Landgriffon"
                  /> */}
                </div>
                <MobileNavigation items={navigationItems} />
              </div>
              <div className="flex flex-shrink-0 p-4">
                <UserDropdown />
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="flex lg:flex-shrink-0">
        <div className="flex flex-col w-28">
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-primary">
            <div className="flex-1">
              {/* TODO: Logo should be here */}
              <DesktopNavigation items={navigationItems} />
            </div>

            <div className="flex-shrink-0 flex pb-5">
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
