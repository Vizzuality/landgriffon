import ProjectedDataIcon from 'components/icons/projected-data';
import type { Props as LegendProps } from 'recharts/types/component/Legend';

const LegendChart = ({ payload }: LegendProps) => (
  <div className="flex justify-between">
    <ul className="flex flex-wrap">
      {payload
        .filter(({ type }) => type !== 'none')
        .map((item) => (
          <li key={item.value} className="flex items-center mr-2 space-x-1">
            <div
              className="w-2 h-3 rounded shrink-0 grow-0"
              style={{ backgroundColor: `${item.color}` }}
            />
            <div className="overflow-hidden text-xs whitespace-nowrap text-ellipsis max-w-[100px]">
              {item.value}
            </div>
          </li>
        ))}
    </ul>
    <div className="flex items-center space-x-1">
      <ProjectedDataIcon />
      <div className="text-xs whitespace-nowrap">Projected data</div>
    </div>
  </div>
);

export default LegendChart;
