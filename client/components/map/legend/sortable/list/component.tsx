import {
  Children, cloneElement, FC, isValidElement, useCallback, useMemo, useState,
} from 'react';
import cx from 'classnames';

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

import SortableItem from './item';

export interface SortableListProps {
  className?: string;
  children: React.ReactNode;
  onChangeOrder: (id: string[]) => void;
}

export const SortableList: FC<SortableListProps> = ({
  children,
  onChangeOrder,
}: SortableListProps) => {
  const [activeId, setActiveId] = useState(null);

  const ActiveItem = useMemo(() => {
    const activeChildArray = Children.map(children, (Child) => {
      if (isValidElement(Child)) {
        const { props } = Child;
        const { id } = props;

        if (id === activeId) {
          return Child;
        }
        return null;
      }
      return null;
    });

    return activeChildArray[0] || null;
  }, [children, activeId]);

  const itemsIds = useMemo(() => Children.map(children, (Child) => {
    if (isValidElement(Child)) {
      const { props } = Child;
      const { id } = props;
      return id;
    }

    return null;
  }), [children]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    if (!active) return;
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over.id) {
      const oldIndex = itemsIds.indexOf(active.id);
      const newIndex = itemsIds.indexOf(over.id);

      if (onChangeOrder) onChangeOrder(arrayMove(itemsIds, oldIndex, newIndex));
    }
  }, [itemsIds, onChangeOrder]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext
        items={itemsIds}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cx({
            'w-full': true,
          })}
        >
          {Children
            .map(children, (Child) => {
              if (isValidElement(Child)) {
                const { props: { id } } = Child;
                return (
                  <SortableItem id={id}>
                    {cloneElement(Child)}
                  </SortableItem>
                );
              }
              return null;
            })}
        </div>
      </SortableContext>

      <DragOverlay>
        {isValidElement(ActiveItem) ? cloneElement(ActiveItem) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default SortableList;
