import { NUMBER_FORMAT } from 'utils/number-format';

type CustomTooltipProps = {
  payload: {
    value: number;
    name: string;
    color: string;
    type: string;
  }[];
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ payload }) => (
  <div className="p-4 text-gray-900 bg-white border rounded-md max-w-[200px]">
    <ul className="space-y-2">
      {payload
        .filter(({ type }) => type !== 'none')
        .map((item) => (
          <li key={item.value} className="flex justify-between space-x-2">
            <div
              className="w-2 h-3 rounded shrink-0 grow-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 text-left truncate">{item.name}</div>
            <div className="text-gray-400">{NUMBER_FORMAT(item.value as number)}</div>
          </li>
        ))}
    </ul>
  </div>
);

export default CustomTooltip;
