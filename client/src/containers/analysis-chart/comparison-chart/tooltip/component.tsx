import classNames from 'classnames';

import { NUMBER_FORMAT } from 'utils/number-format';

type CustomTooltipProps = {
  payload: {
    value: number;
    payload: {
      absoluteDifference: number;
    };
  }[];
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ payload }) => {
  // We will assume that actual-data is the first item and the scenario is the second one
  const actualDataValue = payload[0].value;
  const scenarioValue = payload[1].value;
  const absoluteDifference = payload[1].payload.absoluteDifference;

  return (
    <div className="p-4 text-gray-900 bg-white border border-gray-200 rounded-md">
      <div className="flex items-center space-x-2">
        <div>{NUMBER_FORMAT(scenarioValue)}</div>
        <div
          className={classNames(
            'rounded-sm px-1 text-xs',
            absoluteDifference > 0
              ? 'text-[#DC3C51] bg-[#DC3C51]/10'
              : 'text-[#078A3C] bg-[#078A3C]/10',
          )}
        >
          {absoluteDifference > 0 && '+'}
          {absoluteDifference < 0 && '-'}
          {NUMBER_FORMAT(absoluteDifference)}
        </div>
      </div>
      <div className="text-gray-400">Actual data: {NUMBER_FORMAT(actualDataValue)}</div>
    </div>
  );
};

export default CustomTooltip;
