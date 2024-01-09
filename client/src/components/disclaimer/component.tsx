import { Transition } from '@headlessui/react';
import classNames from 'classnames';
import { ExclamationIcon } from '@heroicons/react/outline';

import type { PropsWithChildren } from 'react';

const WRAPPER_CLASS = {
  default: 'border-navy-400',
  warning: 'border-orange-500',
  error: 'border-red-400',
  success: 'border-green-800',
};

const ICON_BG_CLASS = {
  default: 'bg-gray-50',
  warning: 'bg-orange-50',
  error: 'bg-red-50',
  success: 'bg-green-50',
};

const ICON_CLASS = {
  default: 'text-gray-500',
  warning: 'text-orange-500',
  error: 'text-red-400',
  success: 'text-green-800',
};

export type DisclaimerProps = PropsWithChildren & {
  variant: 'default' | 'warning' | 'error' | 'success';
  icon?: React.ReactNode;
  open?: boolean;
};

const Disclaimer: React.FC<DisclaimerProps> = ({
  variant = 'default',
  icon,
  children,
  open = true,
}) => {
  return (
    <Transition
      show={open}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={classNames(
          'mt-6 rounded-md border bg-white p-6 text-left text-sm',
          WRAPPER_CLASS[variant],
        )}
      >
        <div className="flex items-center space-x-6">
          <div className="flex-none">
            {icon || (
              <div
                className={classNames(
                  'flex h-[72px] w-[72px] items-center justify-center rounded-full',
                  ICON_BG_CLASS[variant],
                )}
              >
                <ExclamationIcon
                  className={classNames('h-8 w-8 text-orange-500', ICON_CLASS[variant])}
                />
              </div>
            )}
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </Transition>
  );
};

export default Disclaimer;
