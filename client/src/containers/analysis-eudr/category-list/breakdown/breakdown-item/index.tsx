import { formatPercentage } from '@/utils/number-format';

const BreakdownItem = ({
  name,
  color,
  icon,
  value,
}: {
  name: string;
  color: string;
  icon: string;
  value: number;
}): JSX.Element => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="mr-2 h-2 w-2 rounded-full bg-[#4AB7F3]" />
        <span>{name}</span>
      </div>
      <div className="shrink-0 grow-0">
        <div className="text-center">
          {formatPercentage(value)} <span className="text-xs">of suppliers</span>
        </div>
        <div className="h-[2px] w-[340px] bg-gray-200">
          <div className={`h-[2px] ${color}`} style={{ width: formatPercentage(value) }} />
        </div>
      </div>
    </div>
  );
};

export default BreakdownItem;
