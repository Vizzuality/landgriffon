import { MenuIcon } from '@heroicons/react/outline';

import { useAppDispatch } from 'store/hooks';
import { setMenuMobileOpen } from 'store/features/ui';
import LandgriffonLogo from 'containers/logo/component';

const HeaderMobile = () => {
  const dispatch = useAppDispatch();

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between bg-green-700 px-4 py-2 sm:px-6 lg:px-8">
        <div>
          <LandgriffonLogo />
        </div>
        <div>
          <button
            type="button"
            className="-mr-3 inline-flex h-12 w-12 items-center justify-center text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => dispatch(setMenuMobileOpen(true))}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderMobile;
