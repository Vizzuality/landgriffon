import type { FC } from 'react';
import cx from 'classnames';

import type { ChartData } from 'hooks/analysis/types';

type LegendChartTypes = {
  activeArea: string;
  indicatorData: ChartData;
  onClick: (key: string, id: string) => void;
};

const Legend: FC<LegendChartTypes> = ({ activeArea, onClick, indicatorData }: LegendChartTypes) => {
  const { keys, id, colors } = indicatorData;

  return (
    <ul className="flex flex-row flex-wrap gap-x-3 gap-y-1 mt-2">
      {keys.map((key) => (
        <li key={key} className="flex items-center gap-x-1">
          <button type="button" className="flex items-center" onClick={() => onClick(key, id)}>
            <span
              className="w-2.5 h-2.5 rounded-full mr-1"
              style={{ backgroundColor: colors[key] }}
            />
            <span
              title={key}
              className={cx('text-xs', {
                'truncate text-ellipsis max-w-[74px]':
                  keys.length > 4 && activeArea !== `${key}-${id}`,
                'text-gray-500': activeArea !== `${key}-${id}`,
                'opacity-70 text-gray-900': activeArea && activeArea !== `${key}-${id}`,
              })}
            >
              {key}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Legend;
