import React, { useCallback } from 'react';
import { UTCDate } from '@date-fns/utc';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { eudr, setFilters } from 'store/features/eudr';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

import type { DateRange } from 'react-day-picker';

// ! the date range is hardcoded for now
export const DATES_RANGE = [new UTCDate('2020-12-31'), new UTCDate()];

const dateFormatter = (date: Date) => format(date, 'dd/MM/yyyy');

const DatesRange = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const {
    filters: { dates },
  } = useAppSelector(eudr);

  const handleDatesChange = useCallback(
    (dates: DateRange) => {
      if (dates) {
        dispatch(setFilters({ dates }));
      }
    },
    [dispatch],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="space-x-1 border-gray-300 bg-white">
          <span className="text-gray-500">
            from{' '}
            <span className="text-gray-900">{dates.from ? dateFormatter(dates.from) : '-'}</span> to{' '}
            <span className="text-gray-900">{dates.to ? dateFormatter(dates.to) : '-'}</span>
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto space-x-2" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          disabled={{
            before: DATES_RANGE[0],
            after: DATES_RANGE[1],
          }}
          selected={dates}
          onSelect={handleDatesChange}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatesRange;
