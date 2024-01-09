import { useCallback } from 'react';
import classNames from 'classnames';

import ProjectedDataIcon from 'components/icons/projected-data';

import type { Props as LegendProps } from 'recharts/types/component/Legend';
import type { Payload } from 'recharts/types/component/DefaultLegendContent';

interface ExtendedPayload extends Payload {
  payload?: Payload['payload'] & {
    fillOpacity?: number;
  };
}

export interface ExtendedLegendProps extends LegendProps {
  payload: ExtendedPayload[];
  legendKey: string | null;
}

const LegendChart: React.FC<ExtendedLegendProps> = ({
  payload,
  legendKey,
  onClick = () => null,
}) => {
  const handleClick = useCallback(onClick, [onClick]);

  return (
    <div className="flex justify-between space-x-2.5">
      <ul className="flex flex-wrap gap-1.5">
        {payload
          .filter(({ type }) => type !== 'none')
          .map((item, index) => (
            <li
              key={item.value}
              className={classNames(
                'flex cursor-pointer items-center space-x-1 rounded border px-1 py-0.5 hover:border-black',
                {
                  'opacity-50': legendKey && legendKey !== item.id,
                },
              )}
              onClick={handleClick.bind(null, item, index)}
            >
              <div
                className="h-3 w-[6px] shrink-0 grow-0 rounded bg-gray-400"
                style={{
                  ...((!legendKey || legendKey === item.id) && {
                    backgroundColor: `${item.color}`,
                  }),
                }}
              />
              <div
                className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap text-xs"
                title={item.value}
              >
                {item.value}
              </div>
            </li>
          ))}
      </ul>
      <div>
        <div className="flex items-center space-x-1">
          <ProjectedDataIcon />
          <div className="whitespace-nowrap py-1 text-xs">Projected data</div>
        </div>
      </div>
    </div>
  );
};

export default LegendChart;
