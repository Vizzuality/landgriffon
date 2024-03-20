import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { format } from 'date-fns';
import { groupBy } from 'lodash-es';

import { useEUDRSupplier } from '@/hooks/eudr';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { eudrDetail } from '@/store/features/eudr-detail';
import { EUDR_COLOR_RAMP } from '@/utils/colors';
import { Badge } from '@/components/ui/badge';
import InfoModal from '@/components/legend/item/info-modal';

const SupplierSourcingInfoChart = (): JSX.Element => {
  const [showBy, setShowBy] = useState<'byVolume' | 'byArea'>('byVolume');
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
  const { supplierId }: { supplierId: string } = useParams();
  const {
    filters: { dates },
  } = useAppSelector(eudrDetail);

  const { data, isFetching } = useEUDRSupplier(
    supplierId,
    {
      startAlertDate: dates.from,
      endAlertDate: dates.to,
    },
    {
      select: (data) => data?.sourcingInformation,
    },
  );

  const parsedData = useMemo(() => {
    if (showBy === 'byVolume') {
      const plotsByYear = groupBy(data?.[showBy], 'year');

      return Object.keys(groupBy(data?.[showBy], 'year')).map((year) => ({
        year: `${year}-01-01`,
        ...Object.fromEntries(
          plotsByYear[year].map(({ plotName, percentage }) => [plotName, percentage]),
        ),
      }));
    }

    if (showBy === 'byArea') {
      const plots = data?.[showBy]?.map(({ plotName, percentage }) => ({
        plotName,
        percentage,
      }));

      // ! for now, we are hardcoding the date and showing just the baseline (2020)
      return [
        {
          year: '2020-01-01',
          ...Object.fromEntries(plots?.map(({ plotName, percentage }) => [plotName, percentage])),
        },
      ];
    }
  }, [data, showBy]);

  const plotConfig = useMemo(() => {
    if (!parsedData?.[0]) return [];

    return Object.keys(parsedData[0])
      .filter((key) => key !== 'year')
      .map((key, index) => ({
        name: key,
        color: EUDR_COLOR_RAMP[index],
      }));
  }, [parsedData]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium">Percentage of sourcing volume per plot</h4>
          <InfoModal
            info={{
              title: 'Percentage of sourcing volume per plot',
              description:
                "This chart displays the percentage of sourcing volume per plot of land by year for the selected supplier. It illustrates the distribution of sourcing activities across different plots of land over time, providing insights into the supplier's sourcing patterns and land utilization.",
            }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xs uppercase">Show by</span>
          <div>
            <Button
              variant="ghost"
              type="button"
              className={cn(
                'h-[22px] rounded-none rounded-bl-md rounded-tl-md border border-gray-300 text-gray-300',
                {
                  'border-navy-400 text-navy-400': showBy === 'byVolume',
                },
              )}
              onClick={() => {
                setShowBy('byVolume');
              }}
            >
              Volume
            </Button>
            <Button
              variant="ghost"
              type="button"
              className={cn(
                'h-[22px] rounded-none rounded-br-md rounded-tr-md border border-gray-300 text-gray-300',
                {
                  'border-navy-400 text-navy-400': showBy === 'byArea',
                },
              )}
              onClick={() => {
                setShowBy('byArea');
              }}
            >
              Area
            </Button>
          </div>
        </div>
      </div>
      {!parsedData?.length && isFetching && (
        <div className="flex h-[175px] items-center justify-center text-gray-300">
          Fetching data...
        </div>
      )}
      {!parsedData?.length && !isFetching && (
        <div className="flex h-[175px] items-center justify-center text-gray-300">
          No data available
        </div>
      )}
      {parsedData?.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {plotConfig.map(({ name, color }) => (
              <Badge
                key={name}
                variant="secondary"
                className={cn(
                  'flex cursor-pointer items-center space-x-1 rounded border border-gray-200 bg-white p-1 text-gray-900',
                  {
                    'bg-secondary/80': selectedPlots.includes(name),
                  },
                )}
                onClick={() => {
                  setSelectedPlots((prev) => {
                    if (prev.includes(name)) {
                      return prev.filter((item) => item !== name);
                    }
                    return [...prev, name];
                  });
                }}
              >
                <span
                  className="inline-block h-[12px] w-[5px] rounded-[18px]"
                  style={{
                    background: color,
                  }}
                />
                <span>{name}</span>
              </Badge>
            ))}
          </div>

          <div>
            <ResponsiveContainer width="100%" height={showBy === 'byArea' ? 100 : 350}>
              <BarChart
                data={parsedData}
                margin={{
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
                layout="vertical"
                barSize={14}
              >
                <CartesianGrid strokeDasharray="3 1" vertical={false} shapeRendering="crispEdges" />
                <XAxis
                  domain={['dataMin - 5', 'dataMax + 5']}
                  stroke="#40424B"
                  strokeWidth={1}
                  shapeRendering="crispEdges"
                  tick={{ fontSize: 10 }}
                  ticks={[0, 25, 50, 75, 100]}
                  tickLine={false}
                  type="number"
                  label={
                    <Label
                      value={showBy === 'byVolume' ? 'Volume (%)' : 'Area (%)'}
                      position="insideLeft"
                      offset={-200}
                      style={{ fill: '#40424B', fontSize: 10, transform: 'translateY(-5px)' }}
                    />
                  }
                />
                <YAxis
                  axisLine={false}
                  dataKey="year"
                  shapeRendering="crispEdges"
                  stroke="#40424B"
                  tick={({ y, payload }) => (
                    <g x={0} y={y}>
                      <text x={0} y={y + 7} textAnchor="start">
                        {format(new Date(payload.value), 'yyyy')}
                      </text>
                    </g>
                  )}
                  tickLine={false}
                  type="category"
                  width={200}
                />
                {/* <Tooltip
                  cursor={{ fill: 'transparent' }}
                  labelFormatter={(value: string) => format(new Date(value), 'yyyy')}
                  formatter={(value: number, name) => [`${value.toFixed(2)}%`, name]}
                /> */}
                {plotConfig.map(({ name, color }) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    stackId="a"
                    fill={color}
                    shapeRendering="crispEdges"
                    fillOpacity={
                      selectedPlots.length ? (selectedPlots.includes(name) ? 1 : 0.2) : 1
                    }
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default SupplierSourcingInfoChart;
