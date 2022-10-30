import { useCallback } from 'react';
import classNames from 'classnames';

import type { Props as LegendProps } from 'recharts/types/component/Legend';
import type { Payload } from 'recharts/types/component/DefaultLegendContent';

interface ExtendedPayload extends Payload {
  payload?: Payload['payload'] & {
    value: string;
    color: string;
    type: string;
    fillOpacity?: number;
  };
}

export interface ExtendedLegendProps extends LegendProps {
  payload: ExtendedPayload[];
}

const LegendChart: React.FC<ExtendedLegendProps> = ({ payload, onClick = () => null }) => {
  const handleClick = useCallback(onClick, [onClick]);

  return (
    <div className="flex justify-between">
      <ul className="flex flex-wrap">
        {payload
          .filter(({ type }) => type !== 'none')
          .map((item, index) => (
            <li
              key={item.value}
              className={classNames('flex items-center mr-2 space-x-1 cursor-pointer', {
                'opacity-50': item.payload.fillOpacity === 0.1,
              })}
              onClick={handleClick.bind(null, item, index)}
            >
              <div
                className="w-[16px] h-[1px] border-b-2"
                style={{ borderColor: `${item.color}` }}
              />
              <div className="overflow-hidden text-xs whitespace-nowrap text-ellipsis max-w-[150px]">
                {item.value === 'scenarioOneValue' && 'Scenario'}
                {item.value === 'scenarioTwoValue' && 'Scenario compared'}
                {item.value === 'value' && 'Actual data'}
              </div>
            </li>
          ))}
      </ul>
      <div className="flex items-center space-x-1">
        <div className="w-[16px] h-[1px] border-b-2 border-dashed border-gray-900" />
        <div className="text-xs whitespace-nowrap">Projected data</div>
      </div>
    </div>
  );
};

export default LegendChart;
