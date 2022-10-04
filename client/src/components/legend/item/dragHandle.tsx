import { SortableListenersContext } from 'components/sortable/component';
import type { HTMLAttributes } from 'react';
import { useContext } from 'react';
import cx from 'classnames';

import DragHandleSvg from 'components/icons/dragHandle';

const DragHandle: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  const sortableListeners = useContext(SortableListenersContext);

  if (!sortableListeners) {
    return null;
  }

  return (
    <div
      className={cx(
        className,
        'p-0.5 pt-1 text-gray-400 h-fit',
        // 'flex flex-row w-[0.625rem] p-0.5 pt-1 h-[1.125rem]',
        // 'grid grid-cols-2 grid-rows-3 gap-x-0.5 gap-y-[0.1875rem] h-fit',
        {
          'cursor-grab': !sortableListeners.isDragging,
          'cursor-grabbing': sortableListeners.isDragging,
        },
      )}
      {...props}
      {...sortableListeners.attributes}
      {...sortableListeners.listeners}
    >
      <DragHandleSvg />
    </div>
  );
};

export default DragHandle;
