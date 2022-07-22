import LineChart from 'components/chart/line/component';

import type { LineChartCellProps } from './types';

const LineChartCell: React.FC<LineChartCellProps> = ({ ...props }: LineChartCellProps) => (
  <div
    style={{ width: +props.column.width, height: 50 }}
    className="ka-cell-text text-center font-bold uppercase text-xs flex justify-center w-full px-4 m-auto"
  >
    <LineChart chartConfig={props.rowData[props.column.key]} />
  </div>
);

export default LineChartCell;
