import { UTCDate } from '@date-fns/utc';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { EUDR_COLOR_RAMP } from '@/utils/colors';
import { useEUDRSupplier } from '@/hooks/eudr';
import { useAppSelector } from '@/store/hooks';
import { eudrDetail } from '@/store/features/eudr-detail';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DeforestationAlertsChart = (): JSX.Element => {
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
  const { supplierId }: { supplierId: string } = useParams();
  const {
    filters: { dates },
  } = useAppSelector(eudrDetail);
  const { data } = useEUDRSupplier(
    supplierId,
    {
      startAlertDate: dates.from,
      endAlertDate: dates.to,
    },
    {
      select: (data) => data?.alerts?.values,
    },
  );

  const parsedData = data
    ?.map((item) => {
      return {
        ...item,
        ...Object.fromEntries(item.plots.map((plot) => [plot.plotName, plot.alertCount])),
        alertDate: new UTCDate(item.alertDate).getTime(),
      };
    })
    ?.sort((a, b) => new UTCDate(a.alertDate).getTime() - new UTCDate(b.alertDate).getTime());

  const plotConfig = useMemo(() => {
    if (!parsedData?.[0]) return [];

    return Array.from(
      new Set(parsedData.map((item) => item.plots.map((plot) => plot.plotName)).flat()),
    ).map((key, index) => ({
      name: key,
      color: EUDR_COLOR_RAMP[index] || '#000',
    }));
  }, [parsedData]);

  const xDomain = useMemo(() => {
    if (!parsedData?.length) return [];

    return [
      new UTCDate(parsedData[0].alertDate).getTime(),
      new UTCDate(parsedData[parsedData?.length - 1].alertDate).getTime(),
    ];
  }, [parsedData]);

  return (
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
      <ResponsiveContainer width="100%" height={285}>
        <LineChart
          data={parsedData}
          margin={{
            top: 20,
            bottom: 15,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            type="number"
            scale="time"
            dataKey="alertDate"
            domain={xDomain}
            tickFormatter={(value: string | number, x) => {
              if (x === 0) return format(new UTCDate(value), 'LLL yyyy');
              return format(new UTCDate(value), 'LLL');
            }}
            tickLine={false}
            padding={{ left: 20, right: 20 }}
            axisLine={false}
            className="text-xs"
            tickMargin={15}
          />
          <YAxis tickLine={false} axisLine={false} label="(nº)" className="text-xs" />
          <Tooltip labelFormatter={(v) => format(new UTCDate(v), 'dd/MM/yyyy')} />
          {plotConfig?.map(({ name, color }) => {
            return (
              <Line
                key={name}
                dataKey={name}
                stroke={color}
                strokeWidth={3}
                strokeOpacity={selectedPlots.length ? (selectedPlots.includes(name) ? 1 : 0.2) : 1}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default DeforestationAlertsChart;
