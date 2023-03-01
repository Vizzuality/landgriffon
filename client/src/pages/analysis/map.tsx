import { MapProvider } from 'react-map-gl';

import useEffectOnce from 'hooks/once';
import { setVisualizationMode } from 'store/features/analysis';
import { useAppDispatch } from 'store/hooks';
import ApplicationLayout from 'layouts/application';
import AnalysisLayout from 'layouts/analysis';
import AnalysisMap from 'containers/analysis-visualization/analysis-map';
import TitleTemplate from 'utils/titleTemplate';

import type { NextPageWithLayout } from 'pages/_app';
import type { ReactElement } from 'react';

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

export function getServerSideProps({ query }) {
  return { props: { query } };
}

export default MapPage;
