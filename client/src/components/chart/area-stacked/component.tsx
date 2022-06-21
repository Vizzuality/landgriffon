import { useCallback, useMemo } from 'react';

import { AreaStack, Bar, Line } from '@visx/shape';
import { Axis, Orientation } from '@visx/axis';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { GridRows } from '@visx/grid';
import { Annotation, Label, LineSubject } from '@visx/annotation';
import { useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';

import { bisector } from 'd3-array';

import { BIG_NUMBER_FORMAT } from 'utils/number-format';

import Tooltip from 'components/chart/area-stacked/tooltip';

const getDate = (d) => new Date(d.date).valueOf();
const getY0 = (d) => d[0];
const getY1 = (d) => d[1];
const bisectDate = bisector((d) => new Date(d.date)).center;
const yNumTicks = 5;

export type AreaStackedProps = {
  id: string;
  title: string;
  data: {
    id: string;
    current: boolean;
    date: string;
  }[];
  yAxisLabel?: string;
  width?: number;
  height?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  keys?: string[];
  colors?: Record<string, string>;
  activeArea: string;
  target?: number;
  projection?: number;
  settings?: {
    tooltip: boolean;
    projection: boolean;
    target: boolean;
  };
};

const AreaStacked: React.FC<AreaStackedProps> = ({
  id,
  title,
  data,
  yAxisLabel,
  width = 400,
  height = 200,
  margin = { top: 16, right: 0, bottom: 16, left: 60 },
  keys = [],
  colors,
  target,
  projection,
  activeArea,
  settings = {
    tooltip: true,
    projection: true,
    target: false,
  },
}) => {
  const { showTooltip, hideTooltip, tooltipData, tooltipTop, tooltipLeft } = useTooltip();
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
      }, 0),
    ),
  );
  // Y: scale
  const yScale = scaleLinear<number>({
    range: [yRangeMax, 0],
    domain: [0, yDomainMax],
  });

  // Callbacks
  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1 < 0 ? 0 : index - 1];
      const d1 = data[index - 1];
      const lastDate = data.reduce((a, b) => (a.date > b.date ? a : b)).date;
      let d = d0;

      if (d1 && getDate(d1) && data[index + 1]?.date) {
        d = getDate(d0).valueOf() - x0.valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
      }

      if (!data[index + 1]?.date && data[index]?.date === lastDate) {
        d = getDate(data[index]).valueOf() < x0.valueOf() ? data[index] : d1;
      }

      const y = keys.reduce((acc, k) => {
        if (typeof d[k] === 'number') {
          return acc + d[k];
        }
        return 0;
      }, 0);

      showTooltip({
        tooltipData: d,
        tooltipLeft: xScale(getDate(d)),
        tooltipTop: yScale(y),
      });
    },
    [xScale, data, keys, showTooltip, yScale],
  );

  const xOffset = useCallback((index) => (index < yNumTicks ? '0.5rem' : '-0.2rem'), []);

  if (!width || !height) return null;

  return (
    <div className="relative">
      <svg width={width} height={height}>
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
            keys={[...keys].reverse()}
            x={(d) => xScale(getDate(d.data)) ?? 0}
            y0={(d) => yScale(getY0(d)) ?? 0}
            y1={(d) => yScale(getY1(d)) ?? 0}
          >
            {({ stacks, path }) =>
              stacks.map((stack) => (
                <path
                  key={`stack-${stack.key}`}
                  d={path(stack) || ''}
                  stroke="#FFF"
                  strokeOpacity={0.25}
                  strokeWidth={0.5}
                  fill={colors[stack.key]}
                  opacity={!activeArea || `${stack.key}-${id}` === activeArea ? 1 : 0.3}
                />
              ))
            }
          </AreaStack>

          <AreaStack
            width={xRangeMax}
            height={yRangeMax}
            data={projectedData}
            keys={[...keys].reverse()}
            x={(d) => xScale(getDate(d.data)) ?? 0}
            y0={(d) => yScale(getY0(d)) ?? 0}
            y1={(d) => yScale(getY1(d)) ?? 0}
          >
            {({ stacks, path }) =>
              stacks.map((stack) => (
                <path
                  key={`stack-${stack.key}`}
                  d={path(stack) || ''}
                  stroke="#FFF"
                  strokeOpacity={0.25}
                  strokeWidth={0.5}
                  fill={colors[stack.key]}
                  fillOpacity={0.4}
                />
              ))
            }
          </AreaStack>
          {/* Tooltip Area */}
          <Bar
            width={xRangeMax}
            height={yRangeMax}
            fill="transparent"
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />

          {/* Highlight */}
          {settings.tooltip && tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: 0 }}
                to={{ x: tooltipLeft, y: yRangeMax }}
                stroke="#999"
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + 1}
                r={4}
                fill="black"
                fillOpacity={0.1}
                stroke="black"
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                fill="#999"
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}

          {/* X Axis */}
          <Axis
            top={yRangeMax}
            orientation={Orientation.bottom}
            scale={xScale}
            hideTicks
            hideAxisLine
            tickLabelProps={(props, index) => ({
              dy: -1,
              dx: xOffset(index),
              fill: '#AEB1B5', // text-gray-400
              fontFamily: 'Arial',
              fontSize: 9,
              textAnchor: 'middle',
            })}
            numTicks={yNumTicks}
          />

          {/* Y Axis */}
          <Axis
            orientation={Orientation.left}
            scale={yScale}
            label={yAxisLabel}
            labelClassName="text-gray-500 text-[10px]"
            labelOffset={50}
            axisClassName="p-6"
            left={6}
            hideTicks
            hideAxisLine
            numTicks={4}
            tickFormat={BIG_NUMBER_FORMAT}
            tickLabelProps={() => ({
              dx: '-0.25em',
              dy: '0.25em',
              fill: '#AEB1B5', // text-gray-400
              fontFamily: 'Arial',
              fontSize: 9,
              textAnchor: 'end',
            })}
          />
          {/* Target */}
          {typeof target !== 'undefined' && target !== null && settings.target && (
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
                  strokeWidth: 0.2,
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
          {typeof lastCurrentIndex !== 'undefined' &&
            lastCurrentIndex !== null &&
            settings.projection && (
              <Annotation x={xScale(getDate({ date: `01/01/${projection}` }))}>
                <LineSubject
                  orientation="vertical"
                  stroke="#999"
                  strokeDasharray="5 2"
                  min={0}
                  max={yRangeMax}
                />
                <Label
                  width={51}
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
                    strokeWidth: 0.2,
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
      </svg>

      {settings.tooltip && (
        <Tooltip
          className="z-10"
          title={title}
          tooltipTop={tooltipTop}
          tooltipLeft={tooltipLeft + margin.left}
          tooltipData={tooltipData}
          keys={keys}
          colors={colors}
        />
      )}
    </div>
  );
};

export default AreaStacked;
