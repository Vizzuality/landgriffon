import { TooltipWithBounds } from '@visx/tooltip';
import type { ReactNode } from 'react';

import { BIG_NUMBER_FORMAT } from 'utils/number-format';

export type AreaStackedTooltipProps = {
  className?: string;
  title: string | ReactNode;
  tooltipData: {
    id?: string;
    current?: boolean;
    date?: string;
  } | null;
  tooltipTop?: number;
  tooltipLeft?: number;
  keys?: string[];
  colors: Record<string, string>;
};

const AreaStackedTooltip: React.FC<AreaStackedTooltipProps> = ({
  tooltipData,
  tooltipLeft,
  tooltipTop,
  keys,
  colors,
  className,
}) => {
  if (!tooltipData) return null;
  const { date, id, ...rest } = tooltipData;
  delete rest.current;

  const year = new Date(date).getFullYear();
  const values = Object.values(rest);
  const sum = values.reduce((accumulator, value) => accumulator + value, 0);
  return (
    <TooltipWithBounds className={className} top={tooltipTop} left={tooltipLeft}>
      <div className="flex flex-col p-2.5 text-xs max-w-[250px]">
        <h3 className="text-xs text-black">{year}</h3>

        <ul className="py-0.5 space-y-1.5">
          {keys.map((k) => (
            <li key={`${id}-${k}`} className="flex gap-x-1 space-x-2 justify-between">
              <p className="flex items-start space-x-2">
                <span
                  className="w-2.5 mt-[2px] h-2.5 aspect-square rounded-full flex"
                  style={{ background: colors[k] }}
                />
                <span className="text-gray-500">{k}</span>
              </p>
              <span className="text-gray-900">{BIG_NUMBER_FORMAT(tooltipData[k])}</span>
            </li>
          ))}
        </ul>
        <p className="flex w-full justify-between border-t border-gray-100 pt-2 mt-2">
          <span className="text-gray-500">Total</span>
          <span className="text-gray-900">{BIG_NUMBER_FORMAT(sum)}</span>
        </p>
      </div>
    </TooltipWithBounds>
  );
};

export default AreaStackedTooltip;
