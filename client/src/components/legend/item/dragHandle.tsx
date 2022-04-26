import { SortableListenersContext } from 'containers/sortable/component';
import { useContext } from 'react';

const DragHandle: React.FC = () => {
  const sortableListeners = useContext(SortableListenersContext);

  if (!sortableListeners) {
    return null;
  }

  return (
    <div
      className="w-5 h-5 bg-gray-600 flex flex-row m-2"
      {...sortableListeners.attributes}
      {...sortableListeners.listeners}
    ></div>
  );
};

export default DragHandle;
