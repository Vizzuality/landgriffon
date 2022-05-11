import React, { useRef } from 'react';
import { Popover } from '@headlessui/react';
import { offset, useFloating, arrow as arrowMiddleware } from '@floating-ui/react-dom';

import type { TooltipProps } from './types';
import { shift } from '@floating-ui/core';
import classNames from 'classnames';

export const ToolTip: React.FC<TooltipProps> = ({ className, children, content, arrow = true }) => {
  const arrowRef = useRef(null);

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    placement: 'top',
    middleware: [
      offset({ mainAxis: arrow ? 15 : 10 }),
      shift(),
      arrowMiddleware({ element: arrowRef }),
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
            <div className="w-5 h-5 bg-white rotate-45 -translate-y-1/2 bottom-0" />
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default ToolTip;
