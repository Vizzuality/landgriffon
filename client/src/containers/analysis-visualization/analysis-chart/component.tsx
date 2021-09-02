import Chart from 'components/chart';
import AreaStacked from 'components/chart/area-stacked';
import Widget from 'components/widget';
import { useAnalysisChart } from 'lib/hooks/analysis';

export type AnalysisChartProps = {};

const AnalysisChart: React.FC<AnalysisChartProps> = () => {
  const { data, isFetched } = useAnalysisChart();

  return (
    <>
      {isFetched && (
        <Widget title="Carbon emissions (CO2e)">
          <Chart>
            <AreaStacked
              data={data}
              margin={{ top: 12, right: 12, bottom: 30, left: 30 }}
              keys={['beef', 'coal', 'corn', 'duck', 'mint', 'poultry', 'soy']}
              target={120}
              settings={{
                tooltip: true,
                projection: true,
                target: true,
              }}
            />
          </Chart>
        </Widget>
      )}
    </>
  );
};

export default AnalysisChart;
