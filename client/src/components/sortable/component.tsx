import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  SortableContext,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';

import type { SortableListenersContextProps, SortableProps } from './types';
import type { HTMLAttributes } from 'react';

export const SortableListenersContext = React.createContext<SortableListenersContextProps | null>(
  null,
);

const Sortable: React.FC<SortableProps> = ({ onChangeOrder, children, items, ...props }) => {
  const touchSensor = useSensor(TouchSensor);
  const mouseSensor = useSensor(MouseSensor);

  const sensors = useSensors(touchSensor, mouseSensor);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) {
          return;
        }
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        const ordered = arrayMove(items, oldIndex, newIndex);
        onChangeOrder(ordered as string[]);
      }}
    >
      <SortableContext strategy={verticalListSortingStrategy} items={items} {...props}>
        {children}
      </SortableContext>
    </DndContext>
  );
};

interface SortableItemProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  children,
  id,
  className,
  ...props
}) => {
  const {
    attributes,
    listeners = {},
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = { transform: CSS.Translate.toString(transform), transition };

  return (
    <SortableListenersContext.Provider value={{ isDragging, listeners, attributes }}>
      <div
        ref={setNodeRef}
        className={classNames(className, { 'opacity-50': isDragging })}
        style={style}
        {...props}
      >
        {children}
      </div>
    </SortableListenersContext.Provider>
  );
};

export default Sortable;
