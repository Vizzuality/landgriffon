import classNames from 'classnames';
import { uniqBy } from 'lodash-es';

import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis';
import { NUMBER_FORMAT } from 'utils/number-format';

type CustomTooltipProps = {
  payload: {
    value: number;
    stroke: string;
    type: string;
    payload: {
      absoluteDifference: number;
      percentageDifference: number;
    };
  }[];
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ payload }) => {
  const { comparisonMode } = useAppSelector(scenarios);
  const tooltipData = uniqBy(payload, 'stroke');
  // We will assume that actual-data is the first item and the scenario is the second one
  const baseValue = tooltipData[0]?.value;
  const comparedValue = tooltipData[1]?.value;
  const absoluteDifference = tooltipData[1]?.payload.absoluteDifference;
  const percentageDifference = tooltipData[1]?.payload.percentageDifference;

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 text-gray-900">
      <div className="flex items-center space-x-2">
        {(comparedValue || comparedValue === 0) && (
          <div className="flex items-center space-x-2">
            <div
              className="h-[1px] w-[16px] border-b-2"
              style={{ borderColor: tooltipData[1]?.stroke }}
            />
            <div>{NUMBER_FORMAT(comparedValue)}</div>
          </div>
        )}
        {(comparedValue || comparedValue === 0) && (
          <div
            className={classNames(
              'rounded-sm px-1 text-xs',
              absoluteDifference > 0
                ? 'bg-[#DC3C51]/10 text-[#DC3C51]'
                : 'bg-[#078A3C]/10 text-[#078A3C]',
            )}
          >
            {absoluteDifference > 0 && '+'}
            {comparisonMode === 'absolute'
              ? NUMBER_FORMAT(absoluteDifference)
              : `${NUMBER_FORMAT(percentageDifference)}%`}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <div
          className="h-[1px] w-[16px] border-b-2"
          style={{ borderColor: tooltipData[0].stroke }}
        />
        <div className="text-gray-400">{NUMBER_FORMAT(baseValue)}</div>
      </div>
    </div>
  );
};

export default CustomTooltip;
