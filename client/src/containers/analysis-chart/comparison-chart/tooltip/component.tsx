import classNames from 'classnames';
import { uniqBy } from 'lodash';

import { NUMBER_FORMAT } from 'utils/number-format';

type CustomTooltipProps = {
  payload: {
    value: number;
    stroke: string;
    type: string;
    payload: {
      absoluteDifference: number;
    };
  }[];
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ payload }) => {
  const tooltipData = uniqBy(payload, 'stroke');
  // We will assume that actual-data is the first item and the scenario is the second one
  const baseValue = tooltipData[0].value;
  const comparedValue = tooltipData[1].value;
  const absoluteDifference = tooltipData[1].payload.absoluteDifference;

  return (
    <div className="p-4 text-gray-900 bg-white border border-gray-200 rounded-md">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <div
            className="w-[16px] h-[1px] border-b-2"
            style={{ borderColor: tooltipData[1].stroke }}
          />
          <div>{NUMBER_FORMAT(comparedValue)}</div>
        </div>
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
      <div className="flex items-center space-x-2">
        <div
          className="w-[16px] h-[1px] border-b-2"
          style={{ borderColor: tooltipData[0].stroke }}
        />
        <div className="text-gray-400">{NUMBER_FORMAT(baseValue)}</div>
      </div>
    </div>
  );
};

export default CustomTooltip;
