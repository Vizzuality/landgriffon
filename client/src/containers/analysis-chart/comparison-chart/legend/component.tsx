import { useCallback } from 'react';
import classNames from 'classnames';

import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis';
import { useScenario } from 'hooks/scenarios';

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
  const { currentScenario, scenarioToCompare } = useAppSelector(scenarios);
  const { data: scenario } = useScenario(currentScenario);
  const { data: comparedScenario } = useScenario(scenarioToCompare);

  return (
    <div className="flex justify-between">
      <ul className="flex flex-wrap">
        {payload
          .filter(({ type }) => type !== 'none')
          .map((item, index) => (
            <li
              key={item.value}
              className={classNames('mr-2 flex cursor-pointer items-center space-x-1', {
                'opacity-50': item.payload.fillOpacity === 0.1,
              })}
              onClick={handleClick.bind(null, item, index)}
            >
              <div
                className="h-[1px] w-[16px] border-b-2"
                style={{ borderColor: `${item.color}` }}
              />
              <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                {item.value === 'scenarioOneValue' && (
                  <span className="capitalize">
                    {scenario?.title || comparedScenario?.title || 'Scenario'}
                  </span>
                )}
                {item.value === 'scenarioTwoValue' && (
                  <span className="capitalize">
                    {comparedScenario?.title || 'Scenario compared'}
                  </span>
                )}
                {item.value === 'value' && 'Actual data'}
              </div>
            </li>
          ))}
      </ul>
      <div className="flex items-center space-x-1">
        <div className="h-[1px] w-[16px] border-b-2 border-dashed border-gray-900" />
        <div className="whitespace-nowrap text-xs">Projected data</div>
      </div>
    </div>
  );
};

export default LegendChart;
