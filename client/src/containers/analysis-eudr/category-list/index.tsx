import { useState } from 'react';

import DeforestationFreeSuppliersBreakdown, {
  CATEGORY_COLOR as DEFORESTATION_FREE_SUPPLIERS_COLOR,
} from './breakdown/deforestation-free-suppliers';
import SuppliersWithDeforestationAlertsBreakdown, {
  CATEGORY_COLOR as SUPPLIERS_WITH_DEFORESTATION_ALERTS_COLOR,
} from './breakdown/suppliers-with-deforestation-alerts';
import SuppliersWithNoLocationDataBreakdown, {
  CATEGORY_COLOR as SUPPLIERS_WITH_NO_LOCATION_DATA_COLOR,
} from './breakdown/suppliers-with-no-location-data';

import { Button } from '@/components/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatPercentage } from '@/utils/number-format';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    name: 'Deforestation-free suppliers',
    slug: 'deforestation-free-suppliers',
    color: DEFORESTATION_FREE_SUPPLIERS_COLOR,
    // todo move this value field to the component
    value: 0.3,
  },
  {
    name: 'Suppliers with deforestation alerts',
    slug: 'suppliers-with-deforestation-alerts',
    color: SUPPLIERS_WITH_DEFORESTATION_ALERTS_COLOR,
    // todo move this value field to the component
    value: 0.6,
  },
  {
    name: 'Suppliers with no location data',
    slug: 'suppliers-with-no-location-data',
    color: SUPPLIERS_WITH_NO_LOCATION_DATA_COLOR,
    // todo move this value field to the component
    value: 0.1,
  },
] as const;

type CategoryState = Record<(typeof CATEGORIES)[number]['slug'], boolean>;

export const CategoryList = (): JSX.Element => {
  const [categories, toggleCategory] = useState<CategoryState>(
    CATEGORIES.reduce(
      (acc, category) => ({
        ...acc,
        [category.slug]: false,
      }),
      {} as CategoryState,
    ),
  );
  const categoriesWithValues = CATEGORIES.map((category) => ({
    ...category,
    // todo: calculate value field here
  }));

  return (
    <>
      {categoriesWithValues.map((category) => (
        <Collapsible
          key={category.slug}
          className="rounded-xl bg-gray-50 p-5"
          onOpenChange={() => {
            toggleCategory((prev) => ({
              ...prev,
              [category.slug]: !prev[category.slug],
            }));
          }}
        >
          <div className="flex w-full items-center space-x-6">
            <div className="relative flex flex-1 items-center space-x-2 text-left">
              <span
                className="block min-h-4 min-w-4 rounded-full border-2 transition-colors"
                style={{
                  borderColor: category.color,
                  ...(categories[category.slug] && {
                    backgroundColor: category.color,
                  }),
                }}
              />
              <span>{category.name}</span>
            </div>
            <div className="shrink-0 grow-0">
              <div className="text-center">
                {formatPercentage(category.value)} <span className="text-2xs">of suppliers</span>
              </div>
              <div className="h-[2px] w-[340px] bg-gray-200">
                <div
                  className="h-[2px]"
                  style={{
                    width: formatPercentage(category.value),
                    backgroundColor: category.color,
                  }}
                />
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                size="xs"
                variant="white"
                className={cn(
                  'w-[98px] rounded-md border-none text-sm shadow-none transition-colors hover:shadow-none',
                  {
                    'bg-navy-400 text-white hover:bg-navy-600': categories[category.slug],
                  },
                )}
              >
                {categories[category.slug] ? 'Close detail' : 'View detail'}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            {category.slug === 'deforestation-free-suppliers' && (
              <DeforestationFreeSuppliersBreakdown />
            )}
            {category.slug === 'suppliers-with-deforestation-alerts' && (
              <SuppliersWithDeforestationAlertsBreakdown />
            )}
            {category.slug === 'suppliers-with-no-location-data' && (
              <SuppliersWithNoLocationDataBreakdown />
            )}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </>
  );
};

export default CategoryList;
