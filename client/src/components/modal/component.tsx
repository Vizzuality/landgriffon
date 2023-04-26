import { Fragment, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { XIcon } from '@heroicons/react/solid';
import { Dialog, Transition } from '@headlessui/react';

import { CONTENT_CLASSES } from './constants';

import type { ModalProps } from './types';

export const Modal: React.FC<ModalProps> = ({
  title,
  open,
  children,
  className,
  onDismiss,
  theme = 'default',
  dismissible = true,
  size = 'fit',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(open);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="z-40 fixed inset-0">
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>
        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className={classNames(
                'max-h-[90%]',
                { 'p-6': theme !== 'minimal' },
                CONTENT_CLASSES[size],
                className,
              )}
            >
              <div className="overflow-hidden rounded-md bg-white">
                {dismissible && theme === 'default' && (
                  <div className="relative flex items-center mb-4">
                    <div className="text-lg font-medium">{title}</div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="absolute flex items-center px-4 py-4 text-sm text-gray-300 rounded-md -right-4 -top-4 focus:text-black hover:text-black"
                    >
                      <XIcon className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                )}
                {children}
              </div>

              {theme === 'minimal' && dismissible && (
                <div
                  onClick={handleClose}
                  className="absolute z-30 cursor-pointer right-0 top-4 translate-x-1/2 p-6 bg-white rounded-full"
                >
                  <XIcon className="w-4 h-4" />
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
