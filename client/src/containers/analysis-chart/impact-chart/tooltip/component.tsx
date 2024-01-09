import { NUMBER_FORMAT } from 'utils/number-format';

type CustomTooltipProps = {
  payload: {
    dataKey: string;
    value: number;
    name: string;
    color: string;
    type: string;
  }[];
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ payload }) => (
  <div className="max-w-[200px] rounded-md border border-gray-200 bg-white p-4 text-gray-900">
    <ul className="space-y-2">
      {payload
        .filter(({ type }) => type !== 'none')
        .map((item) => (
          <li key={item.dataKey} className="flex justify-between space-x-2">
            <div
              className="h-3 w-2 shrink-0 grow-0 rounded"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 truncate text-left">{item.name}</div>
            <div className="text-gray-400">{NUMBER_FORMAT(item.value as number)}</div>
          </li>
        ))}
    </ul>
  </div>
);

export default CustomTooltip;
