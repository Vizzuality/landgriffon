import React from 'react';
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

import { Button } from '@/components/button';

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
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-gray-400">
          Total numbers of suppliers: <span className="font-mono">46.53P</span>
        </div>
        <div className="flex items-center justify-between">
          <h3>Suppliers by category</h3>
          <div className="flex">
            <div className="text-2xs uppercase">View by:</div>
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
            <Tooltip />
            <Bar dataKey="pv" stackId="a" fill="#4AB7F3" shapeRendering="crispEdges" />
            <Bar dataKey="uv" stackId="a" fill="#FFC038" shapeRendering="crispEdges" />
            <Bar dataKey="amt" stackId="a" fill="#8460FF" shapeRendering="crispEdges" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1">
        <div className="flex items-center space-x-6 rounded-xl bg-gray-50 p-5">
          <div className="flex-1">Deforestation-free suppliers</div>
          <div className="shrink-0 grow-0">
            <div>
              31% <span className="text-xs">of suppliers</span>
            </div>
            <div className="h-[2px] w-[340px] bg-gray-200">
              <div className="h-[2px] bg-[#4AB7F3]" style={{ width: '31%' }} />
            </div>
          </div>
          <div>
            <Button type="button" size="xs" variant="white">
              View details
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-6 rounded-xl bg-gray-50 p-5">
          <div className="flex-1">Suppliers with deforestation alerts</div>
          <div className="shrink-0 grow-0">
            <div>
              36% <span className="text-xs">of suppliers</span>
            </div>
            <div className="h-[2px] w-[340px] bg-gray-200">
              <div className="h-[2px] bg-[#FFC038]" style={{ width: '31%' }} />
            </div>
          </div>
          <div>
            <Button type="button" size="xs" variant="white">
              View details
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-6 rounded-xl bg-gray-50 p-5">
          <div className="flex-1">Suppliers with no location data</div>
          <div className="shrink-0 grow-0">
            <div>
              33% <span className="text-xs">of suppliers</span>
            </div>
            <div className="h-[2px] w-[340px] bg-gray-200">
              <div className="h-[2px] bg-[#8460FF]" style={{ width: '31%' }} />
            </div>
          </div>
          <div>
            <Button type="button" size="xs" variant="white">
              View details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersStackedBar;
