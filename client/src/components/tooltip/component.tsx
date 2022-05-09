import React, { useState } from 'react';
import { Popover } from '@headlessui/react';
import { usePopper } from 'react-popper';

import type { TooltipProps } from './types';

export const ToolTip: React.FC<TooltipProps> = ({
  className,
  children,
  content,
  arrow = false,
}) => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top',
    modifiers: [
      arrow && { name: 'arrow', options: { element: arrowElement } },
      { name: 'offset', options: { offset: [0, arrow ? 15 : 5] } },
    ],
  });

  return (
    <Popover className="relative">
      <Popover.Button ref={setReferenceElement}>{children}</Popover.Button>
      <Popover.Panel
        ref={setPopperElement}
        className={className}
        style={styles.popper}
        {...attributes.popper}
      >
        <div className="drop-shadow-md">
          <div className="z-10">{content}</div>
          {arrow && (
            <div className="-z-10" style={styles.arrow} {...attributes.arrow} ref={setArrowElement}>
              <div className="w-5 h-5 bg-white rotate-45 -translate-y-1/2 bottom-0" />
            </div>
          )}
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default ToolTip;
