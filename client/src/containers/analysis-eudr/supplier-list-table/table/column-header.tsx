import { useCallback } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { Column } from '@tanstack/react-table';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const ICON_CLASSES = 'h-[12px] w-[12px] text-gray-400';

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const handleSorting = useCallback(() => {
    column.toggleSorting();
  }, [column]);

  const sortingValue = column.getCanSort() ? column.getIsSorted() : null;

  if (!column.getCanSort()) {
    return (
      <div className={cn('flex items-center space-x-2 text-nowrap', className)}>
        <span>{title}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center text-nowrap', className)}>
      <Button
        type="button"
        onClick={handleSorting}
        variant="ghost"
        className="h-auto space-x-2 p-1"
      >
        <span>{title}</span>
        {!sortingValue && <ChevronsUpDown className={ICON_CLASSES} />}
        {sortingValue === 'asc' && <ChevronUp className={ICON_CLASSES} />}
        {sortingValue === 'desc' && <ChevronDown className={ICON_CLASSES} />}
      </Button>
    </div>
  );
}
