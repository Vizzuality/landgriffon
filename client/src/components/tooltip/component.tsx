import React, { useRef, useState } from 'react';
import {
  offset,
  useFloating,
  arrow as arrowMiddleware,
  flip,
  useInteractions,
  useHover,
  useClick,
  safePolygon,
  useDismiss,
  autoUpdate,
} from '@floating-ui/react-dom-interactions';
import { shift } from '@floating-ui/core';
import classNames from 'classnames';

import type { Placement } from '@floating-ui/core';

interface TooltipProps {
  className?: string;
  content: React.ReactNode;
  arrow?: boolean;
  theme?: 'light' | 'dark';
  placement?: Placement;
  hoverTrigger?: boolean;
  enabled?: boolean;
}

const THEME: Record<Required<TooltipProps>['theme'], string> = {
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
  enabled = true,
}) => {
  const arrowRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    placement: floatingPlacement,
    context,
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
    middleware: [
      offset({ mainAxis: arrow ? 15 : 10 }),
      flip(),
      shift({ padding: 4 }),
      arrowMiddleware({ element: arrowRef, padding: 5 }),
    ],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, {
      enabled: hoverTrigger && enabled,
      handleClose: safePolygon({ restMs: 50 }),
    }),
    useClick(context, { enabled: !hoverTrigger && enabled, toggle: true }),
    useDismiss(context),
  ]);

  return (
    <>
      <button
        type="button"
        {...getReferenceProps({
          ref: reference,
          className: 'relative',
          onClick: (e) => e.stopPropagation(),
        })}
      >
        {children}
      </button>
      {isOpen && enabled && (
        <div
          {...getFloatingProps({
            className: classNames(className, 'drop-shadow-md w-fit relative'),
            ref: floating,
            style: {
              position: strategy,
              top: y ?? '',
              left: x ?? '',
              // zIndex: 100,
            },
          })}
        >
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
          />
        </div>
      )}
    </>
  );
};

export default ToolTip;
