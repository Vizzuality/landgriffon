import { AreaStack } from '@visx/shape';
import { Axis, Orientation } from '@visx/axis';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { GridRows } from '@visx/grid';
import { Annotation, Label, LineSubject } from '@visx/annotation';

import { timeYear } from 'd3-time';
import { format } from 'd3-format';

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
    current: boolean;
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
  margin = { top: 40, right: 30, bottom: 50, left: 40 },
  keys = [],
}: AreaStackedProps) => {
  if (!width || !height) return null;
  const lastCurrentIndex = data.findIndex((d) => !d.current);
  console.log(lastCurrentIndex);

  // X:
  // X: constants
  const xRangeMax = width - margin.left - margin.right;
  // X: scale
  const xScale = scaleTime<number>({
    nice: true,
    range: [0, xRangeMax],
    domain: [Math.min(...data.map(getDate)), Math.max(...data.map(getDate))],
  });

  // Y:
  // Y: constants
  const yRangeMax = height - margin.top - margin.bottom;
  const yDomainMax = Math.max(
    ...data.map((d) =>
      keys.reduce((acc, k) => {
        if (typeof d[k] === 'number') {
          return acc + d[k];
        }
        return 0;
      }, 0)
    )
  );

  // Y: scale
  const yScale = scaleLinear<number>({
    range: [yRangeMax, 0],
    domain: [0, yDomainMax],
  });

  return (
    <>
      <Group top={margin.top} left={margin.left}>
        {/* Grid */}
        <GridRows
          scale={yScale}
          width={xRangeMax}
          height={yRangeMax}
          stroke="#eeeeee"
          strokeDasharray="1 1"
        />

        {/* Areas */}
        <AreaStack
          width={xRangeMax}
          height={yRangeMax}
          data={data.slice(0, lastCurrentIndex)}
          keys={keys}
          x={(d) => xScale(getDate(d.data)) ?? 0}
          y0={(d) => yScale(getY0(d)) ?? 0}
          y1={(d) => yScale(getY1(d)) ?? 0}
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

        <AreaStack
          width={xRangeMax}
          height={yRangeMax}
          data={data.slice(lastCurrentIndex - 1)}
          keys={keys}
          x={(d) => xScale(getDate(d.data)) ?? 0}
          y0={(d) => yScale(getY0(d)) ?? 0}
          y1={(d) => yScale(getY1(d)) ?? 0}
        >
          {({ stacks, path }) =>
            stacks.map((stack) => (
              <path
                key={`stack-${stack.key}`}
                d={path(stack) || ''}
                stroke="transparent"
                fill={COLORS[stack.key]}
                fillOpacity={0.75}
              />
            ))
          }
        </AreaStack>

        {/* X Axis */}
        <Axis
          top={yRangeMax}
          orientation={Orientation.bottom}
          scale={xScale}
          numTicks={30}
          hideTicks
          hideAxisLine
          tickValues={xScale.ticks(timeYear)}
          tickLabelProps={() => ({
            dy: '0.5em',
            fill: '#222',
            fontFamily: 'Arial',
            fontSize: 10,
            textAnchor: 'middle',
          })}
        />

        {/* Y Axis */}
        <Axis
          orientation={Orientation.left}
          scale={yScale}
          hideTicks
          hideAxisLine
          tickFormat={format('.3~s')}
          tickLabelProps={() => ({
            dx: '-0.25em',
            dy: '-0.25em',
            fill: '#222',
            fontFamily: 'Arial',
            fontSize: 10,
            textAnchor: 'end',
          })}
        />

        {/* Target */}
        <Annotation y={yScale(250)}>
          <LineSubject
            orientation="horizontal"
            stroke="#999"
            strokeDasharray="2 1"
            min={0}
            max={xRangeMax}
          />

          <Label
            width={41}
            title="Target"
            horizontalAnchor="start"
            verticalAnchor="middle"
            x={5}
            backgroundPadding={{
              top: 4,
              left: 8,
              bottom: 4,
              right: 8,
            }}
            backgroundFill="#FFF"
            backgroundProps={{
              rx: 4,
              stroke: '#656565',
              strokeOpacity: 0.5,
              strokeWidth: 0.5,
            }}
            titleFontSize={8}
            titleFontWeight={400}
            titleProps={{
              color: '#656565',
            }}
            showAnchorLine={false}
          />
        </Annotation>

        {/* Projection */}
        <Annotation x={xScale(new Date('01/01/2021').valueOf())}>
          <LineSubject
            orientation="vertical"
            stroke="#999"
            strokeDasharray="2 1"
            min={0}
            max={yRangeMax}
          />

          <Label
            width={53}
            y={5}
            title="Projection"
            horizontalAnchor="middle"
            verticalAnchor="middle"
            backgroundPadding={{
              top: 4,
              left: 8,
              bottom: 4,
              right: 8,
            }}
            backgroundFill="#FFF"
            backgroundProps={{
              rx: 4,
              stroke: '#656565',
              strokeOpacity: 0.5,
              strokeWidth: 0.5,
            }}
            titleFontSize={8}
            titleFontWeight={400}
            titleProps={{
              color: '#656565',
            }}
            showAnchorLine={false}
          />
        </Annotation>
      </Group>
    </>
  );
};

export default AreaStacked;
