import { useMemo } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { setVisualizationMode } from 'store/features/analysis';
import { analysisFilters } from 'store/features/analysis/filters';
import { useIndicators } from 'hooks/indicators';
import useEffectOnce from 'hooks/once';

import ApplicationLayout from 'layouts/application';
import AnalysisLayout from 'layouts/analysis';
import ImpactChart from 'containers/impact-chart';
import Loading from 'components/loading';
import TitleTemplate from 'utils/titleTemplate';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from 'pages/_app';
import type { Indicator } from 'types';

const ChartPage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();
  const { indicator } = useAppSelector(analysisFilters);

  // Show as many charts as there are indicators selected
  const { data, isLoading } = useIndicators();

  const activeIndicators: Indicator[] = useMemo(() => {
    if (indicator?.value === 'all') return data;
    if (data?.length) {
      return data.filter((indicatorData) => indicatorData.id === indicator?.value);
    }
    return [];
  }, [data, indicator]);

  useEffectOnce(() => {
    dispatch(setVisualizationMode('chart'));
  });

  return (
    <div className="pl-6 pr-6 my-6 xl:pl-12">
      <TitleTemplate title="Analysis chart" />
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <Loading className="w-5 h-5 m-auto text-primary" />
        </div>
      )}
      {!isLoading && activeIndicators?.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {activeIndicators.map((indicator) => (
            <ImpactChart key={`impact-chart-${indicator.id}`} indicator={indicator} />
          ))}
        </div>
      )}
    </div>
  );
};

ChartPage.Layout = function getLayout(page: ReactElement) {
  return (
    <ApplicationLayout>
      <AnalysisLayout>{page}</AnalysisLayout>
    </ApplicationLayout>
  );
};

export async function getServerSideProps({ query }) {
  return { props: { query } };
}

export default ChartPage;
