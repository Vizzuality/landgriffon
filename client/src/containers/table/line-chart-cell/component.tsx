import LineChart from 'components/chart/line/component';

import { LineChartCellProps } from './types';

const LineChartCell: React.FC<LineChartCellProps> = ({ ...props }: LineChartCellProps) => (
  <div
    style={{ width: +props.column.width - 20, height: 50 }}
    className="ka-cell-text text-center font-bold uppercase text-xs flex justify-center w-full px-4"
  >
    <LineChart chartConfig={props.rowData[props.column.key]} />
  </div>
);

export default LineChartCell;
