import classNames from 'classnames';
import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';
import { NUMBER_FORMAT, BIG_NUMBER_FORMAT } from 'utils/number-format';

export interface ComparisonCellProps {
  value: number;
  scenarioValue: number;
  absoluteDifference: number;
  percentageDifference: number;
}

const ComparisonCell: React.FC<ComparisonCellProps> = ({
  value,
  scenarioValue,
  absoluteDifference,
  percentageDifference,
}) => {
  const { comparisonMode } = useAppSelector(scenarios);
  if (isNaN(scenarioValue)) return <>{BIG_NUMBER_FORMAT(value)}</>;

  return (
    <div className="mx-auto w-fit">
      <div className="flex flex-row gap-1">
        <div className="my-auto text-base text-gray-900">{NUMBER_FORMAT(scenarioValue)}</div>
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
          {comparisonMode === 'relative' && `${NUMBER_FORMAT(percentageDifference)}%`}
          {comparisonMode === 'absolute' && (
            <>
              {absoluteDifference > 0 && '+'}
              {NUMBER_FORMAT(absoluteDifference)}
            </>
          )}
        </div>
      </div>
      <div className="my-auto text-xs text-left text-gray-400 whitespace-nowrap">
        Actual data: {NUMBER_FORMAT(value)}
      </div>
    </div>
  );
};

export default ComparisonCell;
