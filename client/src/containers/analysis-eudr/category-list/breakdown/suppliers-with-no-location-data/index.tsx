import { useMemo, type ComponentProps } from 'react';
import Flag from 'react-world-flags';

import { getCommodityIconByName } from '../breakdown-item/utils';
import Breakdown from '..';
import { CATEGORIES } from '../..';

import { eudr } from '@/store/features/eudr';
import { useAppSelector } from '@/store/hooks';
import { useEUDRData } from '@/hooks/eudr';

import type BreakdownItem from '../breakdown-item';

const SuppliersWithNoLocationDataBreakdown = () => {
  const {
    viewBy,
    filters: { dates, suppliers, origins, materials, plots },
  } = useAppSelector(eudr);

  const { data } = useEUDRData(
    {
      startAlertDate: dates.from,
      endAlertDate: dates.to,
      producerIds: suppliers?.map(({ value }) => value),
      materialIds: materials?.map(({ value }) => value),
      originIds: origins?.map(({ value }) => value),
      geoRegiondIds: plots?.map(({ value }) => value),
    },
    {
      select: (data) => data?.breakDown,
    },
  );

  const parsedData: ComponentProps<typeof BreakdownItem>[] = useMemo(() => {
    const dataByView = data?.[viewBy] || [];

    return Object.keys(dataByView)
      .filter((key) => key === CATEGORIES[2].name)
      .map((filteredKey) =>
        dataByView[filteredKey].detail
          .map((item) => ({
            ...item,
            color: CATEGORIES[2].color,
            icon: getCommodityIconByName(item.name, { fill: CATEGORIES[2].color }),
            ...(viewBy === 'origins' && {
              icon: <Flag code={item.iso3} className="h-[24px] w-[32px] rounded-md" />,
            }),
          }))
          .flat(),
      )
      .flat();
  }, [data, viewBy]);

  return <Breakdown data={parsedData} />;
};

export default SuppliersWithNoLocationDataBreakdown;
