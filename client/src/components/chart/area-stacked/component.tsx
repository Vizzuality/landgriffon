import { AreaStack } from '@visx/shape';
import { Axis, Orientation } from '@visx/axis';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { GridRows } from '@visx/grid';
import { Annotation, Label, LineSubject } from '@visx/annotation';

import { timeYear } from 'd3-time';
import { format } from 'd3-format';
import { useMemo } from 'react';

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
  target?: number;
};

const AreaStacked: React.FC<AreaStackedProps> = ({
  data,
  width = 400,
  height = 200,
  margin = { top: 40, right: 30, bottom: 50, left: 40 },
  keys = [],
  target,
}: AreaStackedProps) => {
  if (!width || !height) return null;
  const lastCurrentIndex = useMemo(() => {
    const i = data.findIndex((d) => !d.current);
    if (i > -1 && i !== data.length - 1) return i;
    return null;
  }, [data]);

  const currentData = useMemo(() => {
    if (typeof lastCurrentIndex === 'undefined' || lastCurrentIndex === null) return data;

    return data.slice(0, lastCurrentIndex + 1);
  }, [data, lastCurrentIndex]);

  const projectedData = useMemo(() => {
    if (typeof lastCurrentIndex === 'undefined' || lastCurrentIndex === null) return [];

    return data.slice(lastCurrentIndex);
  }, [data, lastCurrentIndex]);

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
          data={currentData}
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
          data={projectedData}
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
                fillOpacity={0.6}
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
        {typeof target !== 'undefined' && target !== null && (
          <Annotation y={yScale(target)}>
            <LineSubject
              orientation="horizontal"
              stroke="#999"
              strokeWidth={0.5}
              strokeDasharray="2 1"
              min={0}
              max={xRangeMax}
            />

            <Label
              width={37}
              title="Target"
              horizontalAnchor="start"
              verticalAnchor="middle"
              x={5}
              backgroundPadding={{
                top: 3,
                left: 6,
                bottom: 3,
                right: 6,
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
        )}

        {/* Projection */}
        {typeof lastCurrentIndex !== 'undefined' && lastCurrentIndex !== null && (
          <Annotation x={xScale(new Date(data[lastCurrentIndex].date).valueOf())}>
            <LineSubject
              orientation="vertical"
              stroke="#999"
              strokeWidth={0.5}
              strokeDasharray="2 1"
              min={0}
              max={yRangeMax}
            />

            <Label
              width={49}
              y={5}
              title="Projection"
              horizontalAnchor="middle"
              verticalAnchor="middle"
              backgroundPadding={{
                top: 3,
                left: 6,
                bottom: 3,
                right: 6,
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
        )}
      </Group>
    </>
  );
};

export default AreaStacked;
