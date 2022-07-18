import { NUMBER_FORMAT, BIG_NUMBER_FORMAT } from 'utils/number-format';

interface ComparisonCellProps {
  value: number;
  interventionValue: number;
  absoluteDifference: number;
}

const ComparisonCell: React.FC<ComparisonCellProps> = ({
  value,
  interventionValue,
  absoluteDifference,
}) => {
  if (isNaN(interventionValue)) return <>{BIG_NUMBER_FORMAT(value)}</>;
  return (
    <div className="">
      <div className="my-auto text-gray-400 line-through text-xxs">{NUMBER_FORMAT(value)}</div>
      <div className="flex flex-row gap-1">
        <div className="my-auto text-sm text-gray-900">{NUMBER_FORMAT(interventionValue)}</div>
        <div className="my-auto text-xs font-semibold text-gray-500">
          ({absoluteDifference > 0 && '+'}
          {NUMBER_FORMAT(absoluteDifference)})
        </div>
      </div>
    </div>
  );
};

export default ComparisonCell;
