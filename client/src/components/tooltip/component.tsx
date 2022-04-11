import React from 'react';
import { Popover } from '@headlessui/react';
import cx from 'classnames';

import type { TooltipProps } from './types';

export const ToolTip: React.FC<TooltipProps> = ({ className, children, content }) => {
  return (
    <Popover className="relative">
      <Popover.Button>{children}</Popover.Button>
      <Popover.Panel
        className={cx('absolute bottom-1 -translate-y-1/2 left-1 -translate-x-1/2', className)}
      >
        <div className="relative">{content}</div>
      </Popover.Panel>
    </Popover>
  );

  // return (
  //   <Tooltip {...mergeProps}>
  //     <button
  //       className={classNames(
  //         'rounded-md focus:outline-none focus:ring-1 focus:ring-green-700',
  //         {
  //           'cursor-pointer': !!props.content,
  //         },
  //         className,
  //       )}
  //       disabled={!props.content}
  //     >
  //       {children}
  //     </button>
  //   </Tooltip>
  // );
};

export default ToolTip;
