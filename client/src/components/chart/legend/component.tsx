type LegendChartProps = {
  payload: {
    value: string;
    color: string;
  }[];
};

const LegendChart: React.FC<LegendChartProps> = ({ payload }) => (
  <div className="flex justify-between">
    <ul className="flex flex-wrap">
      {payload.map((item) => (
        <li key={item.value} className="flex items-center space-x-1 mr-2">
          <div
            className="w-2 h-3 rounded shrink-0 grow-0"
            style={{ backgroundColor: `${item.color}` }}
          />
          <div className="overflow-hidden text-2xs whitespace-nowrap text-ellipsis max-w-[60px]">
            {item.value}
          </div>
        </li>
      ))}
    </ul>
    <div>
      <div></div>
      <div className="text-xs whitespace-nowrap">Projected data</div>
    </div>
  </div>
);

export default LegendChart;
