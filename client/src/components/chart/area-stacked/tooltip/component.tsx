import { TooltipWithBounds } from '@visx/tooltip';
import { ReactNode } from 'react';

import { DATA_NUMBER_FORMAT } from 'containers/analysis-visualization/constants';

export type AreaStackedTooltipProps = {
  title: string | ReactNode;
  tooltipData:
    | {
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
      }
    | unknown;
  tooltipTop?: number;
  tooltipLeft?: number;
  keys?: string[];
  colors: Record<string, string>;
};

const AreaStackedTooltip: React.FC<AreaStackedTooltipProps> = ({
  tooltipData,
  tooltipLeft,
  tooltipTop,
  title,
  keys,
  colors,
}: AreaStackedTooltipProps) => {
  if (!tooltipData) return null;

  return (
    <TooltipWithBounds top={tooltipTop} left={tooltipLeft}>
      <div className="flex flex-col p-2.5 space-y-2">
        <h3>{title}</h3>

        <ul className="space-y-1">
          {keys.map((k) => (
            <li key={k} className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors[k] }} />
              <div>{k}:</div>
              <div>{DATA_NUMBER_FORMAT(tooltipData[k])}</div>
            </li>
          ))}
        </ul>
      </div>
    </TooltipWithBounds>
  );
};

export default AreaStackedTooltip;
