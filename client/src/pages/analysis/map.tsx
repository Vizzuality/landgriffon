import AnalysisMap from 'containers/analysis-visualization/analysis-map';
import useEffectOnce from 'hooks/once';
import AnalysisLayout from 'layouts/analysis';
import Head from 'next/head';
import type { NextPageWithLayout } from 'pages/_app';
import { setVisualizationMode } from 'store/features/analysis';
import { useAppDispatch } from 'store/hooks';

const MapPage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    dispatch(setVisualizationMode('map'));
  });

  return (
    <>
      <Head>
        <title>Map View - LandGriffon</title>
      </Head>
      <AnalysisMap />
    </>
  );
};

MapPage.Layout = AnalysisLayout;

export async function getServerSideProps({ query }) {
  return { props: { query } };
}

export default MapPage;
