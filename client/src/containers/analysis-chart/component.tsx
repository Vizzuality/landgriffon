import { useRouter } from 'next/router';

import ImpactChart from './impact-chart';
import ComparisonChart from './comparison-chart';

import type { Indicator } from 'types';

type AnalysisChartProps = {
  indicator: Indicator;
};

const AnalysisChart: React.FC<AnalysisChartProps> = ({ indicator }) => {
  const { query } = useRouter();
  const { compareScenarioId } = query || {};

  if (compareScenarioId) return <ComparisonChart indicator={indicator} />;

  return <ImpactChart indicator={indicator} />;
};

export default AnalysisChart;
