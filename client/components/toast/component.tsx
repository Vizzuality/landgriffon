import { FC, useCallback, useEffect, useRef } from 'react';
import cx from 'classnames';

import SUCCESS_SVG from 'svgs/notifications/success.svg?sprite';
import ERROR_SVG from 'svgs/notifications/error.svg?sprite';
import WARNING_SVG from 'svgs/notifications/warning.svg?sprite';
import INFO_SVG from 'svgs/notifications/info.svg?sprite';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import Icon from 'components/icon';

import { motion, useAnimation } from 'framer-motion';

import { ToastProps, ToastTheme } from './types';

const THEME: ToastTheme = {
  info: {
    icon: INFO_SVG,
    bg: 'from-blue-400 to-blue-700',
    hoverBg: 'from-blue-100 to-blue-400',
  },
  success: {
    icon: SUCCESS_SVG,
    bg: 'from-green-400 to-green-700',
    hoverBg: 'from-green-100 to-green-400',
  },
  warning: {
    icon: WARNING_SVG,
    bg: 'from-yellow-400 to-yellow-700',
    hoverBg: 'from-yellow-100 to-yellow-400',
  },
  error: {
    icon: ERROR_SVG,
    bg: 'from-red-400 to-red-700',
    hoverBg: 'from-red-100 to-red-400',
  },
};

export const Toast: FC<ToastProps> = ({
  id,
  content,
  level = 'info',
  autoDismiss = true,
  onDismiss,
}: ToastProps) => {
  const DURATION = 5;
  const controls = useAnimation();
  const progress = useRef(0);

  const ICON = THEME[level || 'info'].icon;

  useEffect(() => {
    if (autoDismiss) {
      controls.start({
        y: '100%',
        transition: { duration: DURATION },
      });
    }
  }, [controls, autoDismiss]);

  const handleProgressUpdate = useCallback(
    ({ y }) => {
      const y2 = parseInt(y, 10);
      progress.current = y2 / 100;
    },
    [progress]
  );

  const handleDismiss = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{
        ease: 'anticipate',
        duration: 0.5,
      }}
    >
      <div
        role="alert"
        className={cx({
          'w-full pointer-events-auto mb-2': true,
        })}
      >
        <div
          className="flex w-full p-2 text-gray-500 transition bg-white shadow-md rounded-2xl hover:ring-white hover:ring-4 hover:ring-opacity-40"
          onMouseEnter={() => {
            controls.stop();
          }}
          onMouseLeave={() => {
            controls.start({
              y: '100%',
              transition: { duration: DURATION - DURATION * progress.current },
            });
          }}
        >
          <div className="flex flex-grow">
            <div
              className={cx({
                'relative w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden z-20':
                  true,
              })}
            >
              <div
                className={cx({
                  'absolute top-0 left-0 z-0 w-full h-full bg-gradient-to-b': true,
                  [THEME[level]?.hoverBg]: true,
                })}
              />
              <motion.div
                className={cx({
                  'absolute top-0 left-0 z-10 w-full h-full bg-gradient-to-b': true,
                  [THEME[level]?.bg]: true,
                })}
                initial={{ y: '0%' }}
                animate={controls}
                onUpdate={handleProgressUpdate}
                onAnimationComplete={handleDismiss}
              />

              <Icon icon={ICON} className="relative z-20 self-center w-5 h-5" />
            </div>

            <div className="flex-grow ml-2.5">{content}</div>
          </div>

          <button
            type="button"
            className="flex items-center justify-center flex-shrink-0 w-10 h-10 ml-5"
            onClick={handleDismiss}
          >
            <Icon icon={CLOSE_SVG} className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Toast;
