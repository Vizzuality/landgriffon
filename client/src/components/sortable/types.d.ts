import type { useSortable, SortableContextProps } from '@dnd-kit/sortable';

export interface SortableProps extends SortableContextProps {
  onChangeOrder: (orderedIds: string[]) => void;
}

export interface SortableListenersContextProps {
  listeners: SyntheticListenerMap;
  attributes: ReturnType<typeof useSortable>['attributes'];
  isDragging: boolean;
}
