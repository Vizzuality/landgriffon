type LegendChartProps = {
  payload: {
    value: string;
    color: string;
  }[];
};

const LegendChart: React.FC<LegendChartProps> = ({ payload }) => (
  <div className="flex justify-between">
    <ul className="flex flex-wrap">
      {payload.reverse().map((item) => (
        <li key={item.value} className="flex items-center mr-2 space-x-1">
          <div className="w-[16px] h-[1px] border-b-2" style={{ borderColor: `${item.color}` }} />
          <div className="overflow-hidden text-xs whitespace-nowrap text-ellipsis max-w-[150px]">
            {item.value === 'scenarioValue' && 'Scenario'}
            {item.value === 'value' && 'Actual data'}
          </div>
        </li>
      ))}
    </ul>
    <div className="flex items-center space-x-1">
      <div className="w-[16px] h-[1px] border-b-2 border-dashed border-gray-900" />
      <div className="text-xs whitespace-nowrap">Projected data</div>
    </div>
  </div>
);

export default LegendChart;
