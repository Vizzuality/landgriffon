import React, { useCallback, useMemo } from 'react';
import { UTCDate } from '@date-fns/utc';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { eudrDetail, setFilters } from 'store/features/eudr-detail';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

import type { DateRange } from 'react-day-picker';
const dateFormatter = (date: Date) => format(date, 'yyyy-MM-dd');

// ! the date range is hardcoded for now
export const DATES_RANGE = ['2020-12-31', dateFormatter(new Date())];

const DatesRange = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const {
    filters: { dates },
  } = useAppSelector(eudrDetail);

  const handleDatesChange = useCallback(
    (dates: DateRange) => {
      if (dates) {
        dispatch(
          setFilters({
            dates: {
              from: dateFormatter(dates.from),
              to: dateFormatter(dates.to),
            },
          }),
        );
      }
    },
    [dispatch],
  );

  const datesToDate = useMemo(() => {
    return {
      from: dates.from ? new UTCDate(dates.from) : undefined,
      to: dates.to ? new UTCDate(dates.to) : undefined,
    };
  }, [dates]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto space-x-1 border border-gray-200 bg-white shadow-sm"
        >
          <span className="text-gray-500">
            Deforestation alerts from <span className="text-gray-900">{dates.from || '-'}</span> to{' '}
            <span className="text-gray-900">{dates.to || '-'}</span>
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto space-x-2" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          disabled={{
            before: new UTCDate(DATES_RANGE[0]),
            after: new UTCDate(DATES_RANGE[1]),
          }}
          selected={datesToDate}
          onSelect={handleDatesChange}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatesRange;
