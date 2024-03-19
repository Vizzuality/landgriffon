import { UTCDate } from '@date-fns/utc';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Dot,
  ResponsiveContainer,
} from 'recharts';
import { useParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { EUDR_COLOR_RAMP } from '@/utils/colors';
import { useEUDRSupplier } from '@/hooks/eudr';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { eudrDetail } from '@/store/features/eudr-detail';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { setBasemap, setPlanetCompareLayer, setPlanetLayer } from '@/store/features/eudr';

import type { DotProps } from 'recharts';

type DotPropsWithPayload = DotProps & { payload: { alertDate: number } };

const DeforestationAlertsChart = (): JSX.Element => {
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<number>(null);
  const { supplierId }: { supplierId: string } = useParams();
  const dispatch = useAppDispatch();
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
      select: (data) => data?.alerts?.values,
    },
  );

  const handleClickDot = useCallback(
    (payload: DotPropsWithPayload['payload']) => {
      if (payload.alertDate) {
        if (selectedDate === payload.alertDate) {
          setSelectedDate(null);
          return dispatch(setPlanetCompareLayer({ active: false }));
        }

        const date = new UTCDate(payload.alertDate);

        setSelectedDate(date.getTime());

        dispatch(setBasemap('planet'));
        dispatch(setPlanetLayer({ active: true }));

        dispatch(
          setPlanetCompareLayer({
            active: true,
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
          }),
        );
      }
    },
    [dispatch, selectedDate],
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
      {!data?.length && isFetching && (
        <div className="flex h-[175px] items-center justify-center text-gray-300">
          Fetching data...
        </div>
      )}
      {!data?.length && !isFetching && (
        <div className="flex h-[175px] items-center justify-center text-gray-300">
          No data available
        </div>
      )}
      {data?.length > 0 && (
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
                    strokeOpacity={
                      selectedPlots.length ? (selectedPlots.includes(name) ? 1 : 0.2) : 1
                    }
                    connectNulls
                    dot={(props: DotPropsWithPayload) => {
                      const { payload } = props;
                      return (
                        <Dot
                          {...props}
                          onClick={() => handleClickDot(payload)}
                          className={cn('cursor-pointer', {
                            // todo: fill when we have design
                            '': payload.alertDate === selectedDate,
                          })}
                        />
                      );
                    }}
                    activeDot={(props: DotPropsWithPayload) => {
                      const { payload } = props;
                      return (
                        <Dot
                          {...props}
                          onClick={() => handleClickDot(payload)}
                          className={cn('cursor-pointer', {
                            // todo: fill when we have design
                            '': payload.alertDate === selectedDate,
                          })}
                        />
                      );
                    }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </>
  );
};

export default DeforestationAlertsChart;
