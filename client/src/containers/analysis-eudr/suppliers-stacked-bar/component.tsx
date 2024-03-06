import React, { useCallback } from 'react';
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

import CategoryList from '@/containers/analysis-eudr/category-list';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label as RadioLabel } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { eudr, setViewBy } from '@/store/features/eudr';

export const VIEW_BY_OPTIONS = [
  {
    label: 'Commodities',
    value: 'commodities',
  },
  {
    label: 'Countries',
    value: 'countries',
  },
] as const;

const data = [
  {
    name: 'Cattle',
    uv: 40,
    pv: 30,
    amt: 30,
  },
  {
    name: 'Cocoa',
    uv: 30,
    pv: 13,
    amt: 57,
  },
  {
    name: 'Coffee',
    uv: 20,
    pv: 70,
    amt: 10,
  },
  {
    name: 'Oil palm',
    uv: 27,
    pv: 39,
    amt: 34,
  },
  {
    name: 'Wood',
    uv: 28,
    pv: 48,
    amt: 24,
  },
  {
    name: 'Soya',
    uv: 23,
    pv: 38,
    amt: 39,
  },
  {
    name: 'Rubber',
    uv: 34,
    pv: 43,
    amt: 23,
  },
];

const SuppliersStackedBar = () => {
  const { viewBy } = useAppSelector(eudr);
  const dispatch = useAppDispatch();

  const handleViewBy = useCallback(
    (value: typeof viewBy) => {
      dispatch(setViewBy(value));
    },
    [dispatch],
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-gray-400">
          Total numbers of suppliers: <span className="font-mono">46.53P</span>
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
      <div className="h-[300px] rounded-xl bg-gray-50 px-5 pb-1 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
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
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="pv" stackId="a" fill="#4AB7F3" shapeRendering="crispEdges" />
            <Bar dataKey="uv" stackId="a" fill="#FFC038" shapeRendering="crispEdges" />
            <Bar dataKey="amt" stackId="a" fill="#8460FF" shapeRendering="crispEdges" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <CategoryList />
    </div>
  );
};

export default SuppliersStackedBar;
