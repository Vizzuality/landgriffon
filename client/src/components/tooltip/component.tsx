import React, { useRef } from 'react';
import { Popover } from '@headlessui/react';
import { offset, useFloating, arrow as arrowMiddleware } from '@floating-ui/react-dom';

import type { TooltipProps } from './types';
import { shift } from '@floating-ui/core';
import classNames from 'classnames';

export const ToolTip: React.FC<TooltipProps> = ({
  className,
  children,
  content,
  arrow = false,
  color = 'white',
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
        <div
          className={classNames('drop-shadow-md rounded-md px-2 py-1', {
            'bg-black text-white': color === 'black',
            'bg-white': color === 'white',
          })}
        >
          <div className="z-10 min-w-[3rem] w-fit text-center">{content}</div>
          <div
            className={classNames('-z-10', { hidden: !arrow })}
            style={{
              top: arrowY ?? '',
              left: arrowX ?? '',
              position: strategy,
            }}
            ref={arrowRef}
          >
            <div
              className={classNames('w-5 h-5 rotate-45 -translate-y-1/2 bottom-0', {
                'bg-black': color === 'black',
                'bg-white': color === 'white',
              })}
            />
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default ToolTip;
