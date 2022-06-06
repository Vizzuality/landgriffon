import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { offset, useFloating, arrow as arrowMiddleware, flip } from '@floating-ui/react-dom';

import { Placement, shift } from '@floating-ui/core';
import classNames from 'classnames';

interface TooltipProps {
  className?: string;
  content: React.ReactNode;
  arrow?: boolean;
  theme?: 'light' | 'dark';
  placement?: Placement;
  hoverTrigger?: boolean;
}

const THEME: Record<TooltipProps['theme'], string> = {
  light: 'bg-white',
  dark: 'bg-gray-900',
};

const ARROW_POSITION_CLASSES = {
  top: 'translate-y-1/2 bottom-0 rounded-r-sm',
  right: '-translate-x-1/2 left-0 rounded-b-sm',
  bottom: '-translate-y-1/2 top-0 rounded-l-sm',
  left: 'translate-x-1/2 right-0 rounded-t-sm',
};

export const ToolTip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
  className,
  children,
  content,
  arrow = true,
  theme = 'light',
  placement = 'top',
  hoverTrigger = false,
}) => {
  const arrowRef = useRef(null);

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    placement: floatingPlacement,
    update,
  } = useFloating({
    placement,
    strategy: 'fixed',
    middleware: [
      offset({ mainAxis: arrow ? 15 : 10 }),
      flip(),
      shift({ padding: 4 }),
      arrowMiddleware({ element: arrowRef, padding: 5 }),
    ],
  });

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    console.log('update');

    update();
  }, [content, update]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <Popover className="relative">
      <Popover.Button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div ref={reference}>{children}</div>
      </Popover.Button>
      <Transition show={hoverTrigger ? isHovered : undefined}>
        <Popover.Panel
          static={hoverTrigger}
          ref={floating}
          className={className}
          style={{
            position: strategy,
            top: y ?? '',
            left: x ?? '',
            zIndex: 100,
          }}
        >
          <div className="drop-shadow-md w-fit relative">
            <div className="z-10">{content}</div>
            <div
              ref={arrowRef}
              style={{
                top: arrowY ?? '',
                left: arrowX ?? '',
              }}
              className={classNames(
                '-z-10 absolute',
                { hidden: !arrow },
                ARROW_POSITION_CLASSES[floatingPlacement],
                'w-3 h-3 rotate-45',
                THEME[theme],
              )}
            ></div>
            {/* <div
              className={classNames(
                '-z-10 absolute',
                { hidden: !arrow },
                ARROW_POSITION_CLASSES[floatingPlacement],
              )}
              ref={arrowRef}
              style={{
                top: arrowY ?? '',
                left: arrowX ?? '',
              }}
            >
              <div className={classNames('w-3 h-3 rotate-45', THEME[theme])} />
            </div> */}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default ToolTip;
