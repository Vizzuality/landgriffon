import classNames from 'classnames';
import { useCallback } from 'react';

import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';
import { NUMBER_FORMAT } from 'utils/number-format';

export interface ComparisonCellProps {
  value: number;
  scenarioValue: number;
  absoluteDifference: number;
  percentageDifference: number;
  unit?: string;
  formatter?: (value: number) => string;
}

const ComparisonCell: React.FC<ComparisonCellProps> = ({
  value,
  scenarioValue,
  absoluteDifference,
  percentageDifference,
  unit,
  formatter = NUMBER_FORMAT,
}) => {
  const { comparisonMode } = useAppSelector(scenarios);

  const formatWithUnit = useCallback(
    (value: number, unit?: string) => {
      const formattedNumber = formatter(value);

      if (unit) {
        return `${formattedNumber} ${unit}`;
      }

      return formattedNumber;
    },
    [formatter],
  );

  if (isNaN(scenarioValue)) return <>{formatter(value)}</>;

  return (
    <div className="mr-auto w-fit">
      <div className="flex flex-row gap-1">
        <div className="my-auto text-sm text-gray-900 whitespace-nowrap">
          {formatWithUnit(scenarioValue, unit)}
        </div>
        <div
          className={classNames(
            'my-auto text-xs font-semibold text-gray-500 rounded-[4px] px-1 py-0.5',
            {
              'bg-green-400/40 text-green-700':
                (comparisonMode === 'relative' && percentageDifference <= 0) ||
                (comparisonMode === 'absolute' && absoluteDifference <= 0),
              'bg-red-400/20 text-red-800':
                (comparisonMode === 'relative' && percentageDifference > 0) ||
                (comparisonMode === 'absolute' && absoluteDifference > 0),
            },
          )}
        >
          {comparisonMode === 'relative' && <>{formatter(percentageDifference)}%</>}
          {comparisonMode === 'absolute' && (
            <>
              {absoluteDifference > 0 && '+'}
              {formatter(absoluteDifference)}
            </>
          )}
        </div>
      </div>
      <div className="my-auto text-xs text-left text-gray-300 whitespace-nowrap line-through">
        {formatWithUnit(value, unit)}
      </div>
    </div>
  );
};

export default ComparisonCell;
