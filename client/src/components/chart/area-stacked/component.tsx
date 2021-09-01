import { AreaStack } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';

const getDate = (d) => new Date(d.date).valueOf();
const getY0 = (d) => d[0];
const getY1 = (d) => d[1];

const COLORS = {
  beef: '#FFFF00',
  coal: '#FFEE00',
  corn: '#FFDD00',
  duck: '#FFCC00',
  mint: '#FFBB00',
  poultry: '#FFAA00',
  soy: '#FF9900',
};

export type AreaStackedProps = {
  data: {
    id: string;
    date: string;
    coal?: number;
    beef?: number;
    corn?: number;
    duck?: number;
    poultry?: number;
    mint?: number;
    soy?: number;
  }[];
  width?: number;
  height?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  keys?: string[];
};

const AreaStacked: React.FC<AreaStackedProps> = ({
  data,
  width = 400,
  height = 200,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  keys = [],
}: AreaStackedProps) => {
  if (!width || !height) return null;
  // bounds
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  // Y: max
  const domainMaxY = Math.max(
    ...data.map((d) => {
      const sum = keys.reduce((acc, k) => acc + d[k], 0);

      return sum;
    })
  );

  // scales
  const xScale = scaleTime<number>({
    range: [0, xMax],
    domain: [Math.min(...data.map(getDate)), Math.max(...data.map(getDate))],
  });
  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [0, domainMaxY],
  });

  return (
    <AreaStack
      top={margin.top}
      left={margin.left}
      data={data}
      keys={keys}
      x={(d) => xScale(getDate(d.data)) ?? 0}
      y0={(d) => yScale(getY0(d)) ?? 0}
      y1={(d) => yScale(getY1(d)) ?? 0}
      offset="none"
    >
      {({ stacks, path }) =>
        stacks.map((stack) => (
          <path
            key={`stack-${stack.key}`}
            d={path(stack) || ''}
            stroke="transparent"
            fill={COLORS[stack.key]}
          />
        ))
      }
    </AreaStack>
  );
};

export default AreaStacked;
