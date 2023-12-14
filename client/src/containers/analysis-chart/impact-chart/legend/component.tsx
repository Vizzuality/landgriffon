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
                'flex items-center space-x-1 cursor-pointer border py-0.5 px-1 rounded hover:border-black',
                {
                  'opacity-50': legendKey && legendKey !== item.id,
                },
              )}
              onClick={handleClick.bind(null, item, index)}
            >
              <div
                className="w-[6px] h-3 rounded shrink-0 grow-0 bg-gray-400"
                style={{
                  ...((!legendKey || legendKey === item.id) && {
                    backgroundColor: `${item.color}`,
                  }),
                }}
              />
              <div
                className="overflow-hidden text-xs whitespace-nowrap text-ellipsis max-w-[100px]"
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
          <div className="text-xs whitespace-nowrap py-1">Projected data</div>
        </div>
      </div>
    </div>
  );
};

export default LegendChart;
