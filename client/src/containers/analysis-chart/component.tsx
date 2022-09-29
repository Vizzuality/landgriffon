import ImpactChart from './impact-chart';
import ComparisonChart from './comparison-chart';

import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';

import type { Indicator } from 'types';

type AnalysisChartProps = {
  indicator: Indicator;
};

const AnalysisChart: React.FC<AnalysisChartProps> = ({ indicator }) => {
  const { isComparisonEnabled } = useAppSelector(scenarios);

  if (isComparisonEnabled) return <ComparisonChart indicator={indicator} />;

  return <ImpactChart indicator={indicator} />;
};

export default AnalysisChart;
