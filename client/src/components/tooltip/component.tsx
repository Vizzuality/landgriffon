import React, { useRef, useState } from 'react';
import { Popover } from '@headlessui/react';
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

  const arrowPositionClasses = {
    top: '-translate-y-1/2 bottom-0',
    right: '-translate-x-1/2 left-0',
    bottom: 'translate-y-1/2 top-0',
    left: 'translate-x-1/2 right-0',
  };

  return (
    <Popover className="relative">
      <Popover.Button
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <div ref={reference}>{children}</div>
      </Popover.Button>
      <div>
        <Popover.Panel
          static={hoverTrigger && isHovered}
          ref={floating}
          className={className}
          style={{
            position: strategy,
            top: y ?? '',
            left: x ?? '',
          }}
        >
          <div className="drop-shadow-md w-fit">
            <div className="z-10">{content}</div>
            <div
              className={classNames('-z-10 absolute', { hidden: !arrow })}
              ref={arrowRef}
              style={{
                top: arrowY ?? '',
                left: arrowX ?? '',
              }}
            >
              <div
                className={classNames(
                  'w-4 h-4 rotate-45',
                  THEME[theme],
                  arrowPositionClasses[floatingPlacement],
                )}
              />
            </div>
          </div>
        </Popover.Panel>
      </div>
    </Popover>
  );
};

export default ToolTip;
