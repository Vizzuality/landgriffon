import ImpactChart from './impact-chart';
import type { Indicator } from 'types';

type AnalysisChartProps = {
  indicator: Indicator;
};

const AnalysisChart: React.FC<AnalysisChartProps> = ({ indicator }) => (
  <ImpactChart indicator={indicator} />
);

export default AnalysisChart;
