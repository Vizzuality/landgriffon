import { useCallback, useMemo, useState } from 'react';

import DeforestationFreeSuppliersBreakdown from './breakdown/deforestation-free-suppliers';
import SuppliersWithDeforestationAlertsBreakdown from './breakdown/suppliers-with-deforestation-alerts';
import SuppliersWithNoLocationDataBreakdown from './breakdown/suppliers-with-no-location-data';

import { Button } from '@/components/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useEUDRData } from '@/hooks/eudr';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { eudr, setTableFilters } from '@/store/features/eudr';
import { themeColors } from '@/utils/colors';

import type { EUDRState } from '@/store/features/eudr';

export const CATEGORIES = [
  {
    name: 'Deforestation-free suppliers',
    color: themeColors.blue[400],
  },
  {
    name: 'Suppliers with deforestation alerts',
    color: '#FFC038',
  },
  {
    name: 'Suppliers with no location data',
    color: '#8561FF',
  },
] as const;

const CATEGORY_TO_FILTER: Record<
  (typeof CATEGORIES)[number]['name'],
  Partial<keyof EUDRState['table']['filters']>
> = {
  [CATEGORIES[0].name]: 'dfs',
  [CATEGORIES[1].name]: 'sda',
  [CATEGORIES[2].name]: 'tpl',
} as const;

type CategoryState = Record<(typeof CATEGORIES)[number]['name'], boolean>;

export const CategoryList = (): JSX.Element => {
  const [categories, toggleCategory] = useState<CategoryState>(
    CATEGORIES.reduce(
      (acc, category) => ({
        ...acc,
        [category.name]: false,
      }),
      {} as CategoryState,
    ),
  );

  const {
    viewBy,
    filters: { dates, suppliers, origins, materials, plots },
    table: { filters: tableFilters },
  } = useAppSelector(eudr);
  const dispatch = useAppDispatch();

  const onClickCategory = useCallback(
    (category: (typeof CATEGORIES)[number]) => {
      toggleCategory((prev) => ({
        ...prev,
        [category.name]: !prev[category.name],
      }));

      dispatch(
        setTableFilters({
          [CATEGORY_TO_FILTER[category.name]]: !tableFilters[CATEGORY_TO_FILTER[category.name]],
        }),
      );
    },
    [dispatch, tableFilters],
  );

  const { data } = useEUDRData(
    {
      startAlertDate: dates.from,
      endAlertDate: dates.to,
      producerIds: suppliers?.map(({ value }) => value),
      materialIds: materials?.map(({ value }) => value),
      originIds: origins?.map(({ value }) => value),
      geoRegionIds: plots?.map(({ value }) => value),
    },
    {
      select: (data) => data?.breakDown,
    },
  );

  const parsedData = useMemo(() => {
    const dataByView = data?.[viewBy] || [];

    return Object.keys(dataByView).map((key) => ({
      name: key,
      ...dataByView[key],
      color: CATEGORIES.find((category) => category.name === key)?.color || '#000',
    }));
  }, [data, viewBy]);

  return (
    <>
      {parsedData.map((category) => (
        <Collapsible
          key={category.name}
          className="rounded-xl bg-gray-50 p-5"
          onOpenChange={() => onClickCategory(category)}
        >
          <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center space-x-6">
              <div className="relative flex flex-1 items-center space-x-2 text-left">
                <span
                  className="block min-h-4 min-w-4 rounded-full border-2 transition-colors"
                  style={{
                    borderColor: category.color,
                    ...(categories[category.name] && {
                      backgroundColor: category.color,
                    }),
                  }}
                />
                <span>{category.name}</span>
              </div>
              <div className="shrink-0 grow-0">
                <div className="text-center">
                  {`${category.totalPercentage.toFixed(2)}%`}{' '}
                  <span className="text-2xs">of suppliers</span>
                </div>
                <div className="h-[2px] w-[340px] bg-gray-200">
                  <div
                    className="h-[2px]"
                    style={{
                      width: `${category.totalPercentage}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>

              <Button
                type="button"
                size="xs"
                variant="white"
                className={cn(
                  'w-[98px] rounded-md border-none text-sm text-gray-500 shadow-none transition-colors hover:shadow-none',
                  {
                    'bg-navy-400 text-white hover:bg-navy-600': categories[category.name],
                  },
                )}
              >
                {categories[category.name] ? 'Close detail' : 'View detail'}
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {category.name === CATEGORIES[0].name && <DeforestationFreeSuppliersBreakdown />}
            {category.name === CATEGORIES[1].name && <SuppliersWithDeforestationAlertsBreakdown />}
            {category.name === CATEGORIES[2].name && <SuppliersWithNoLocationDataBreakdown />}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </>
  );
};

export default CategoryList;
