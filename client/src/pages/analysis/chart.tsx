import { useMemo } from 'react';
import classNames from 'classnames';
import { dehydrate } from '@tanstack/react-query';

import { auth } from '@/pages/api/auth/[...nextauth]';
import { useAppDispatch, useSyncIndicators } from '@/store/hooks';
import { setVisualizationMode } from '@/store/features/analysis';
import { useIndicators } from '@/hooks/indicators';
import useEffectOnce from '@/hooks/once';
import ApplicationLayout from '@/layouts/application';
import AnalysisLayout from '@/layouts/analysis';
import AnalysisChart from '@/containers/analysis-chart';
import AnalysisDynamicMetadata from '@/containers/analysis-visualization/analysis-dynamic-metadata';
import Loading from '@/components/loading';
import TitleTemplate from '@/utils/titleTemplate';
import { tasksSSR } from '@/services/ssr';
import getQueryClient from '@/lib/react-query';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from 'pages/_app';
import type { GetServerSideProps } from 'next';

const ChartPage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();
  const [syncedIndicators] = useSyncIndicators();

  const { data, isLoading } = useIndicators(undefined, {
    select: (data) => data?.data,
  });

  const activeIndicators = useMemo(() => {
    if (!syncedIndicators) return data;
    return data.filter(({ id }) => syncedIndicators.includes(id));
  }, [data, syncedIndicators]);

  useEffectOnce(() => {
    dispatch(setVisualizationMode('chart'));
  });

  return (
    <div className="my-6 pl-6 pr-6 xl:pl-12">
      <TitleTemplate title="Analysis chart" />
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <Loading className="m-auto h-5 w-5 text-navy-400" />
        </div>
      )}
      {!isLoading && activeIndicators?.length > 0 && (
        <>
          <div className="mb-6">
            <AnalysisDynamicMetadata />
          </div>
          <div
            className={classNames('grid gap-6', {
              'grid-cols-1': activeIndicators?.length === 1,
              'grid-cols-1 2xl:grid-cols-2': activeIndicators?.length > 1,
            })}
            data-testid="analysis-charts"
          >
            {activeIndicators.map((indicator) => (
              <AnalysisChart key={`analysis-chart-${indicator.id}`} indicator={indicator} />
            ))}
          </div>
        </>
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

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    const tasks = await tasksSSR({ req, res });
    if (tasks && tasks[0]?.attributes.status === 'processing') {
      return {
        redirect: {
          permanent: false,
          destination: '/data',
        },
      };
    }
    const session = await auth(req, res);
    const queryClient = getQueryClient();

    queryClient.setQueryData(['profile', session.accessToken], session.user);

    return { props: { query, session, dehydratedState: dehydrate(queryClient) } };
  } catch (error) {
    if (error.response.status === 401) {
      return {
        redirect: {
          permanent: false,
          destination: '/auth/signin',
        },
      };
    }
  }
};

export default ChartPage;
