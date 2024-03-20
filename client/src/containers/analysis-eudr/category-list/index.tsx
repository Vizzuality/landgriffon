import { useCallback, useMemo, useState } from 'react';

import DeforestationFreeSuppliersBreakdown from './breakdown/deforestation-free-suppliers';
import SuppliersWithDeforestationAlertsBreakdown from './breakdown/suppliers-with-deforestation-alerts';
import SuppliersWithNoLocationDataBreakdown from './breakdown/suppliers-with-no-location-data';

import { Button } from '@/components/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useEUDRData } from '@/hooks/eudr';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { eudr, setTableFilters } from '@/store/features/eudr';
import { themeColors } from '@/utils/colors';

export const CATEGORIES = [
  {
    name: 'Deforestation-free plots',
    apiName: 'Deforestation-free suppliers',
    key: 'dfs',
    color: themeColors.blue[400],
  },
  {
    name: 'Plots with defrestation alerts',
    apiName: 'Suppliers with deforestation alerts',
    key: 'sda',
    color: '#FFC038',
  },
  {
    name: 'Plots with no location data',
    apiName: 'Suppliers with no location data',
    key: 'tpl',
    color: '#8561FF',
  },
] as const;

type CategoryState = Record<(typeof CATEGORIES)[number]['key'], boolean>;

export const CategoryList = (): JSX.Element => {
  const {
    viewBy,
    filters: { dates, suppliers, origins, materials, plots },
    table: { filters: tableFilters },
  } = useAppSelector(eudr);

  const [categories, toggleCategory] = useState<CategoryState>(
    CATEGORIES.reduce(
      (acc, category) => ({
        ...acc,
        [category.key]: tableFilters[category.key],
      }),
      {} as CategoryState,
    ),
  );

  const dispatch = useAppDispatch();

  const onClickCategory = useCallback(
    (category: (typeof CATEGORIES)[number]) => {
      toggleCategory((prev) => ({
        ...prev,
        [category.key]: !prev[category.key],
      }));

      dispatch(
        setTableFilters({
          [category.key]: !tableFilters[category.key],
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

    return Object.keys(dataByView).map((key) => {
      const category = CATEGORIES.find((category) => category.apiName === key);
      return {
        name: category.name,
        ...dataByView[key],
        key: category?.key,
        color: category?.color || '#000',
      };
    });
  }, [data, viewBy]);

  return (
    <>
      {parsedData.map((category) => (
        <Collapsible
          key={category.key}
          className="group rounded-xl bg-gray-50 p-5"
          onOpenChange={() => onClickCategory(category)}
          defaultOpen={categories[category.key]}
        >
          <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center space-x-6">
              <div className="relative flex flex-1 items-center space-x-2 text-left">
                <span
                  className="block min-h-4 min-w-4 rounded-full border-2 transition-colors"
                  style={{
                    borderColor: category.color,
                    ...(categories[category.key] && {
                      backgroundColor: category.color,
                    }),
                  }}
                />
                <span>{category.name}</span>
              </div>
              <div className="shrink-0 grow-0">
                <div className="text-center">
                  {`${Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(
                    category.totalPercentage,
                  )}%`}{' '}
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
                className="w-[98px] rounded-md border-none text-sm text-gray-500 shadow-none transition-colors hover:shadow-none group-data-[state=open]:bg-navy-400 group-data-[state=open]:text-white group-data-[state=open]:hover:bg-navy-600"
              >
                {categories[category.key] ? 'Close detail' : 'View detail'}
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {category.key === 'dfs' && categories['dfs'] && <DeforestationFreeSuppliersBreakdown />}
            {category.key === 'sda' && categories['sda'] && (
              <SuppliersWithDeforestationAlertsBreakdown />
            )}
            {category.key === 'tpl' && categories['tpl'] && (
              <SuppliersWithNoLocationDataBreakdown />
            )}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </>
  );
};

export default CategoryList;
