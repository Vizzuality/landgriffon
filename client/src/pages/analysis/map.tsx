import { MapProvider } from 'react-map-gl/maplibre';
import { dehydrate } from '@tanstack/react-query';

import { auth } from '@/pages/api/auth/[...nextauth]';
import useEffectOnce from 'hooks/once';
import { setVisualizationMode } from 'store/features/analysis';
import { useAppDispatch } from 'store/hooks';
import ApplicationLayout from 'layouts/application';
import AnalysisLayout from 'layouts/analysis';
import AnalysisMap from 'containers/analysis-visualization/analysis-map';
import TitleTemplate from 'utils/titleTemplate';
import { tasksSSR } from 'services/ssr';
import getQueryClient from '@/lib/react-query';

import type { NextPageWithLayout } from 'pages/_app';
import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';

const MapPage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    dispatch(setVisualizationMode('map'));
  });

  return (
    <>
      <TitleTemplate title="Analysis Map" />
      <MapProvider>
        <AnalysisMap />
      </MapProvider>
    </>
  );
};

MapPage.Layout = function getLayout(page: ReactElement) {
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

export default MapPage;
