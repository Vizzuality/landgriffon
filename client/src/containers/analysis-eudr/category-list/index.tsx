import { useState } from 'react';

import DeforestationFreeSuppliersBreakdown from './breakdown/deforestation-free-suppliers';
import SuppliersWithDeforestationAlertsBreakdown from './breakdown/suppliers-with-deforestation-alerts';
import SuppliersWithNoLocationDataBreakdown from './breakdown/suppliers-with-no-location-data';

import { Button } from '@/components/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatPercentage } from '@/utils/number-format';

const CATEGORIES = [
  {
    name: 'Deforestation-free suppliers',
    slug: 'deforestation-free-suppliers',
    color: 'bg-[#4AB7F3]',
    // todo move this value field to the component
    value: 0.3,
  },
  {
    name: 'Suppliers with deforestation alerts',
    slug: 'suppliers-with-deforestation-alerts',
    color: 'bg-[#FFC038]',
    // todo move this value field to the component
    value: 0.6,
  },
  {
    name: 'Suppliers with no location data',
    slug: 'suppliers-with-no-location-data',
    color: 'bg-[#8460FF]',
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
            <div className="flex-1 text-left">{category.name}</div>
            <div className="shrink-0 grow-0">
              <div className="text-center">
                {formatPercentage(category.value)} <span className="text-xs">of suppliers</span>
              </div>
              <div className="h-[2px] w-[340px] bg-gray-200">
                <div
                  className={`h-[2px] ${category.color}`}
                  style={{ width: formatPercentage(category.value) }}
                />
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button type="button" size="xs" variant="white">
                {categories[category.slug] ? 'Close details' : 'View details'}
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
