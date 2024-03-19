import React, { useCallback, useMemo } from 'react';
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
import { groupBy } from 'lodash-es';

import CategoryList, { CATEGORIES } from '@/containers/analysis-eudr/category-list';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label as RadioLabel } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { eudr, setViewBy } from '@/store/features/eudr';
import { useEUDRData } from '@/hooks/eudr';

export const VIEW_BY_OPTIONS = [
  {
    label: 'Commodities',
    value: 'materials',
  },
  {
    label: 'Countries',
    value: 'origins',
  },
] as const;

const TOOLTIP_LABELS = {
  free: CATEGORIES[0].name,
  alerts: CATEGORIES[1].name,
  noData: CATEGORIES[2].name,
} as const;

const SuppliersStackedBar = () => {
  const {
    viewBy,
    totalSuppliers,
    filters: { dates, suppliers, origins, materials },
  } = useAppSelector(eudr);
  const dispatch = useAppDispatch();

  const handleViewBy = useCallback(
    (value: typeof viewBy) => {
      dispatch(setViewBy(value));
    },
    [dispatch],
  );

  const { data, isFetching } = useEUDRData(
    {
      startAlertDate: dates.from,
      endAlertDate: dates.to,
      producerIds: suppliers?.map(({ value }) => value),
      materialIds: materials?.map(({ value }) => value),
      originIds: origins?.map(({ value }) => value),
    },
    {
      select: (data) => data?.breakDown,
    },
  );

  const parsedData = useMemo(() => {
    const dataByView = data?.[viewBy] || [];

    const dataRootLevel = Object.keys(dataByView)
      .map((key) => ({
        category: key,
        ...dataByView[key],
      }))
      .map(({ detail, category }) => detail.map((x) => ({ ...x, category })).flat())
      .flat();

    return Object.keys(groupBy(dataRootLevel, 'name')).map((material) => ({
      name: material,
      free: dataRootLevel.find(
        ({ name, category }) => name === material && category === 'Deforestation-free suppliers',
      )?.value,
      alerts: dataRootLevel.find(
        ({ name, category }) =>
          name === material && category === 'Suppliers with deforestation alerts',
      )?.value,
      noData: dataRootLevel.find(
        ({ name, category }) => name === material && category === 'Suppliers with no location data',
      )?.value,
    }));
  }, [data, viewBy]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-gray-400">
          Total numbers of suppliers: <span>{totalSuppliers}</span>
        </div>
        <div className="flex items-center justify-between">
          <h3>Suppliers by category</h3>
          <div className="flex space-x-2">
            <div className="text-2xs uppercase text-gray-400">View by:</div>
            <RadioGroup
              defaultValue={viewBy}
              className="flex items-center space-x-2"
              onValueChange={handleViewBy}
            >
              {VIEW_BY_OPTIONS.map((option) => (
                <div key={option?.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <RadioLabel htmlFor={option.value}>{option.label}</RadioLabel>
                </div>
              ))}
            </RadioGroup>
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
          <div className="h-[300px] rounded-xl bg-gray-50 px-5 pb-1 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
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
                      value="Suppliers (%)"
                      position="insideLeft"
                      offset={-200}
                      style={{ fill: '#40424B', fontSize: 10, transform: 'translateY(-5px)' }}
                    />
                  }
                />
                <YAxis
                  axisLine={false}
                  dataKey="name"
                  shapeRendering="crispEdges"
                  stroke="#40424B"
                  tick={({ y, payload }) => (
                    <g x={0} y={y}>
                      <text x={0} y={y + 7} textAnchor="start">
                        {payload.value}
                      </text>
                    </g>
                  )}
                  tickLine={false}
                  type="category"
                  width={200}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  labelFormatter={(value: string) => value}
                  formatter={(value: number, name: keyof typeof TOOLTIP_LABELS) => [
                    `${value.toFixed(2)}%`,
                    TOOLTIP_LABELS[name],
                  ]}
                />
                <Bar
                  dataKey="free"
                  stackId="a"
                  fill={CATEGORIES[0].color}
                  shapeRendering="crispEdges"
                />
                <Bar
                  dataKey="alerts"
                  stackId="a"
                  fill={CATEGORIES[1].color}
                  shapeRendering="crispEdges"
                />
                <Bar
                  dataKey="noData"
                  stackId="a"
                  fill={CATEGORIES[2].color}
                  shapeRendering="crispEdges"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <CategoryList />
        </>
      )}
    </div>
  );
};

export default SuppliersStackedBar;
