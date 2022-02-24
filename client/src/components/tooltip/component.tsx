import React from 'react';
import classNames from 'classnames';
import Tooltip from '@tippyjs/react';

import 'tippy.js/dist/tippy.css';

import { TooltipProps } from './types';

export const ToolTip: React.FC<TooltipProps> = ({
  className,
  children,
  ...props
}: TooltipProps) => {
  const mergeProps = {
    interactive: true,
    trigger: 'mouseenter focus',
    disabled: !props.content,
    ...props,
  };

  return (
    <Tooltip {...mergeProps}>
      <button
        className={classNames(
          'rounded-md focus:outline-none focus:ring-1 focus:ring-green-700',
          {
            'cursor-pointer': !!props.content,
          },
          className,
        )}
        disabled={!props.content}
      >
        {children}
      </button>
    </Tooltip>
  );
};

export default ToolTip;
