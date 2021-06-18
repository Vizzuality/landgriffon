import { Children, FC, cloneElement, isValidElement, useRef } from 'react';
import cx from 'classnames';

import { AnimatePresence, motion } from 'framer-motion';

import { useOverlay, usePreventScroll, useModal, OverlayContainer } from '@react-aria/overlays';
import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';

import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import { ModalProps } from './types';

const COMMON_CONTENT_CLASSES =
  'absolute top-1/2 inset-x-4 sm:left-1/2 transform -translate-y-1/2 sm:-translate-x-1/2 outline-none bg-white flex flex-col flex-grow overflow-hidden rounded-3xl py-7';
const CONTENT_CLASSES = {
  narrow: `sm:w-4/6 md:w-1/2 lg:w-5/12 xl:w-1/3 ${COMMON_CONTENT_CLASSES}`,
  default: `sm:w-4/5 md:w-2/3 lg:1/2 xl:w-2/5 ${COMMON_CONTENT_CLASSES}`,
  wide: `sm:w-10/12 md:w-10/12 lg:w-10/12 xl:w-8/12 ${COMMON_CONTENT_CLASSES}`,
};

const OVERLAY_CLASSES = 'z-50 fixed inset-0 bg-black bg-blur';

export const Modal: FC<ModalProps> = ({
  title,
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
    containerRef
  );
  const { modalProps } = useModal();
  const { dialogProps } = useDialog({ 'aria-label': title }, containerRef);

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
            className={cx({ [OVERLAY_CLASSES]: true })}
          >
            <FocusScope contain restoreFocus autoFocus>
              <div {...overlayProps} {...dialogProps} {...modalProps} ref={containerRef}>
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
                  className={cx({ [CONTENT_CLASSES[size]]: true, [className]: !!className })}
                  style={{
                    maxHeight: '90%',
                  }}
                >
                  {dismissable && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={onDismiss}
                        className="absolute flex items-center px-4 py-4 text-sm text-gray-300 right-4 -top-4 focus:text-black hover:text-black"
                      >
                        <span className="text-xs">Close</span>
                        <Icon icon={CLOSE_SVG} className="inline-block w-3 h-3 ml-2 text-black" />
                      </button>
                    </div>
                  )}

                  {/* Children */}
                  {Children.map(children, (child) => {
                    if (isValidElement(child)) {
                      return cloneElement(child, {
                        onDismiss,
                      });
                    }
                    return null;
                  })}
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
