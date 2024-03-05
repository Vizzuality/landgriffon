import { useMemo, type ComponentProps } from 'react';
import Flag from 'react-world-flags';

import { getCommodityIconByName } from '../breakdown-item/utils';
import Breakdown from '..';

import { eudr } from '@/store/features/eudr';
import { useAppSelector } from '@/store/hooks';

import type BreakdownItem from '../breakdown-item';
import type { CommodityName } from '../breakdown-item/utils';

type CommonData = {
  name: string;
  value: number;
};

type CommodityData = CommonData & {
  name: CommodityName;
};

type CountryData = CommonData & {
  iso3: string;
};

const SAMPLE_DATA: { commodities: CommodityData[]; countries: CountryData[] } = {
  commodities: [
    { name: 'cattle', value: 80 },
    { name: 'cocoa', value: 22 },
    { name: 'coffee', value: 54 },
    { name: 'palm-oil', value: 50 },
    { name: 'wood', value: 11 },
    { name: 'soy', value: 5 },
    { name: 'rubber', value: 70 },
  ],
  countries: [
    { name: 'Italy', value: 33, iso3: 'ITA' },
    { name: 'Spain', value: 56, iso3: 'ESP' },
    { name: 'Brazil', value: 8, iso3: 'BRA' },
  ],
};

export const CATEGORY_COLOR = '#FFC038';

const SuppliersWithDeforestationAlertsBreakdown = () => {
  const { viewBy } = useAppSelector(eudr);

  const data: ComponentProps<typeof BreakdownItem>[] = useMemo(() => {
    if (viewBy === 'commodities') {
      return SAMPLE_DATA[viewBy].map((item) => ({
        ...item,
        color: CATEGORY_COLOR,
        icon: getCommodityIconByName(item.name, { fill: CATEGORY_COLOR }),
      }));
    }

    return SAMPLE_DATA[viewBy].map((item) => ({
      ...item,
      color: CATEGORY_COLOR,
      icon: <Flag code={item.iso3} className="h-[24px] w-[32px] rounded-md" />,
    }));
  }, [viewBy]);

  return <Breakdown data={data} />;
};

export default SuppliersWithDeforestationAlertsBreakdown;
