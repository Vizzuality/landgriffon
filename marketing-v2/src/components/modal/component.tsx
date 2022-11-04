import { useRef } from 'react';

import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from '@heroicons/react/solid';
import { FocusScope } from '@react-aria/focus';
import { useOverlay, usePreventScroll, useModal, OverlayContainer } from '@react-aria/overlays';

import { CONTENT_CLASSES, OVERLAY_CLASSES } from './constants';
import type { ModalProps } from './types';

export const Modal: React.FC<ModalProps> = ({
  open,
  dismissable = true,
  size = 'default',
  children,
  className,
  onDismiss,
}: ModalProps) => {
  const containerRef = useRef();
  const { overlayProps } = useOverlay(
    {
      isKeyboardDismissDisabled: !dismissable,
      isDismissable: dismissable,
      isOpen: open,
      onClose: onDismiss,
    },
    containerRef,
  );
  const { modalProps } = useModal();

  usePreventScroll({ isDisabled: !open });

  return (
    <AnimatePresence>
      {open && (
        <OverlayContainer>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
              transition: {
                delay: 0,
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                delay: 0.125,
              },
            }}
            className={classNames(OVERLAY_CLASSES)}
          >
            <FocusScope contain restoreFocus autoFocus>
              <div {...overlayProps} {...modalProps} ref={containerRef}>
                <motion.div
                  initial={{
                    opacity: 0,
                    y: '-60%',
                    x: '-50%',
                  }}
                  animate={{
                    opacity: 1,
                    y: '-50%',
                    x: '-50%',
                    transition: {
                      delay: 0.125,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: '-60%',
                    x: '-50%',
                    transition: {
                      delay: 0,
                    },
                  }}
                  className={classNames(CONTENT_CLASSES[size], { [className]: !!className })}
                  style={{
                    maxHeight: '90%',
                  }}
                >
                  {dismissable && (
                    <div className="relative flex items-center mb-4">
                      <button
                        type="button"
                        onClick={onDismiss}
                        className="absolute flex items-center px-4 py-4 text-sm text-gray-300 rounded-md -right-4 -top-4 focus:text-black hover:text-black"
                      >
                        <XIcon className="w-6 h-6 text-gray-500" />
                      </button>
                    </div>
                  )}

                  {children}
                </motion.div>
              </div>
            </FocusScope>
          </motion.div>
        </OverlayContainer>
      )}
    </AnimatePresence>
  );
};

export default Modal;
