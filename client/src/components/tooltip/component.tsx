import React, { useRef } from 'react';
import { Popover } from '@headlessui/react';
import { offset, useFloating, arrow as arrowMiddleware } from '@floating-ui/react-dom';

import type { TooltipProps } from './types';
import { shift } from '@floating-ui/core';
import classNames from 'classnames';

const THEME = {
  light: 'bg-white',
  dark: 'bg-gray-900',
};

export const ToolTip: React.FC<TooltipProps> = ({
  className,
  children,
  content,
  arrow = true,
  theme = 'light',
  placement = 'top',
}) => {
  const arrowRef = useRef(null);

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    placement,
    middleware: [
      offset({ mainAxis: arrow ? 15 : 10 }),
      shift({ padding: 4 }),
      arrowMiddleware({ element: arrowRef, padding: 5 }),
    ],
  });

  return (
    <Popover className="relative">
      <Popover.Button>
        <div ref={reference}>{children}</div>
      </Popover.Button>
      <Popover.Panel
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
            <div className={`w-4 h-4 rotate-45 -translate-y-1/2 bottom-0 ${THEME[theme]}`} />
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default ToolTip;
