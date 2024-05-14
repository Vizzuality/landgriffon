import { useCallback, useMemo, useEffect, ComponentProps, Fragment, useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/solid';

import { useSyncIndicators } from 'store/hooks';
import { useIndicators } from 'hooks/indicators';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

const IndicatorsMapFilter = () => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const [syncedIndicators, setSyncedIndicators] = useSyncIndicators();

  const { data, isFetching, isFetched } = useIndicators(
    { sort: 'name' },
    {
      select: (data) => data?.data,
    },
  );

  const options = useMemo(() => {
    const categories = Array.from(
      new Set(data?.map(({ category }) => category).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    const categoryGroups = categories.map((category) => {
      const indicators = data?.filter((indicator) => indicator.category === category);
      const categoryOptions = indicators.map((indicator) => ({
        label: indicator.metadata?.short_name,
        value: indicator.id,
        disabled: indicator.status === 'inactive',
      }));
      return { label: category, value: category, options: categoryOptions };
    });

    return categoryGroups;
  }, [data]);

  const indicatorName = useMemo(() => {
    const indicator = data?.find((indicator) => indicator.id === value);
    return indicator?.metadata?.short_name;
  }, [data, value]);

  const handleChange = useCallback(
    (value: Parameters<ComponentProps<typeof Select>['onValueChange']>[0]) => {
      setSyncedIndicators([value]);
    },
    [setSyncedIndicators],
  );

  useEffect(() => {
    if (syncedIndicators?.length) {
      return setValue(syncedIndicators?.[0]);
    }

    const firstOption = options?.at(0)?.options?.at(0)?.value;

    if (firstOption) {
      setSyncedIndicators([firstOption]);
      setValue(firstOption);
    }
  }, [options, syncedIndicators, indicatorName, setSyncedIndicators]);

  return (
    <Select value={value} onValueChange={handleChange} disabled={!isFetched && isFetching}>
      <SelectTrigger
        className="h-full w-[325px] overflow-ellipsis text-left"
        data-testid="select-indicators-filter"
      >
        <SelectValue>{indicatorName}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <Fragment key={option.value}>
            {!option?.options?.length && (
              <>
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
                <SelectSeparator />
              </>
            )}
            {option?.options?.length > 0 && (
              <Collapsible defaultOpen>
                <SelectGroup>
                  <CollapsibleTrigger className="group">
                    <SelectLabel className="flex items-center">
                      <ChevronRightIcon className="hidden h-4 w-4 text-gray-900 group-data-[state=closed]:block" />
                      <ChevronDownIcon className="hidden h-4 w-4 text-gray-900 group-data-[state=open]:block" />
                      <span className="ml-1">{option.label}</span>
                    </SelectLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {option.options.map((indicator) => (
                      <SelectItem key={indicator.value} value={indicator.value} className="pl-8">
                        {indicator.label}
                      </SelectItem>
                    ))}
                  </CollapsibleContent>
                </SelectGroup>
              </Collapsible>
            )}
          </Fragment>
        ))}
      </SelectContent>
    </Select>
  );
};

export default IndicatorsMapFilter;
