import { SortableListenersContext } from 'components/sortable/component';
import { useContext } from 'react';
import cx from 'classnames';

const DragHandle: React.FC = () => {
  const sortableListeners = useContext(SortableListenersContext);

  if (!sortableListeners) {
    return null;
  }

  return (
    <div
      className={cx('grid grid-cols-2 grid-rows-3 w-3 h-4', {
        'cursor-grab': !sortableListeners.isDragging,
        'cursor-grabbing': sortableListeners.isDragging,
      })}
      {...sortableListeners.attributes}
      {...sortableListeners.listeners}
    >
      {Array(6)
        .fill(true)
        .map((_, i) => (
          <div className="rounded-full bg-gray-300 w-[3px] h-[3px] m-auto" key={i} />
        ))}
    </div>
  );
};

export default DragHandle;
